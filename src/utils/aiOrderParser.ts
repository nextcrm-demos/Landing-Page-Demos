import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment } from '../types';
import { gustosAdicionales } from '../data/defaults';

export interface ParsedOrderResult {
  cart: CartItem[];
  cliente: OrderClient;
  pago: OrderPayment;
  resumen: string;
  source: 'gemini' | 'local_smart';
  rawText: string;
  observaciones?: string;
}

// Word numbers mapping in Spanish
const SPANISH_NUMBERS: Record<string, number> = {
  un: 1, una: 1, uno: 1, '1': 1,
  dos: 2, '2': 2,
  tres: 3, '3': 3,
  cuatro: 4, '4': 4,
  cinco: 5, '5': 5,
  seis: 6, '6': 6,
  siete: 7, '7': 7,
  ocho: 8, '8': 8,
  nueve: 9, '9': 9,
  diez: 10, '10': 10,
  media: 1, medio: 1,
};

// Normalize string removing diacritics and excessive whitespace
export function normalizeSpanish(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Supercharged Spanish POS Order Parser
 * Accurately parses multi-item sentences like:
 * "2 pizzetas mozzarella con panceta y aceitunas, 3 fainas comunes y 2 coca colas de litro y medio para mandar a 18 de julio 1234 a nombre de pedro paga con 2000"
 */
export function parseOrderLocally(
  text: string,
  menuItems: MenuItem[],
  gustosList: Gusto[] = gustosAdicionales
): ParsedOrderResult {
  const cleanText = text.trim();
  const normalized = normalizeSpanish(cleanText);

  const cart: CartItem[] = [];
  const cliente: OrderClient = {
    nombre: '',
    mesa: '',
    telefono: '',
    direccion: '',
  };
  const pago: OrderPayment = {
    tipo: 'local',
    metodo: 'efectivo',
    notas: '',
    programado: false,
    horaProgramada: '',
    abono: '',
    propina: '',
    cadete: 'Samuel',
  };

  let detectedObservations: string[] = [];

  // 1. Detect Delivery / Salon / Mostrador
  if (
    normalized.includes('envio') ||
    normalized.includes('delivery') ||
    normalized.includes('mandar a') ||
    normalized.includes('llevar a') ||
    normalized.includes('enviar a') ||
    normalized.includes('para mandar') ||
    normalized.includes('para llevar a') ||
    normalized.includes('a domicilio') ||
    normalized.includes('calle') ||
    normalized.includes('av.') ||
    normalized.includes('avenida') ||
    normalized.includes('esquina') ||
    normalized.includes('esq')
  ) {
    pago.tipo = 'envio';
  } else if (
    normalized.includes('mesa') ||
    normalized.includes('salon') ||
    normalized.includes('comedor')
  ) {
    pago.tipo = 'mesa';
    const mesaMatch = normalized.match(/mesa\s*([0-9a-zA-Z]+)/i);
    if (mesaMatch) {
      cliente.mesa = mesaMatch[1].toUpperCase();
    }
  } else {
    pago.tipo = 'local';
  }

  // 2. Extract Client Name
  const nameMatch = cleanText.match(/(?:nombre|a nombre de|para|cliente)[:\s]+([A-Za-zÁÉÍÓÚáéíóúñÑ ]+?)(?:[\n,.]|tel|dir|pago|para|con|paga|$)/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    const candidateNorm = normalizeSpanish(candidate);
    if (
      candidate.length > 1 && 
      !['mesa', 'envio', 'delivery', 'llevar', 'retirar', 'local', 'efectivo', 'tarjeta', 'debito', 'credito', 'mostrador'].includes(candidateNorm)
    ) {
      cliente.nombre = candidate.toUpperCase();
    }
  }

  // 3. Extract Phone
  const phoneMatch = cleanText.match(/(?:09\d{7}|2\d{7}|tel(?:efono)?[:\s]*(\d+))/i);
  if (phoneMatch) {
    cliente.telefono = phoneMatch[1] || phoneMatch[0].replace(/\D/g, '');
  }

  // 4. Extract Address
  const addressMatch = cleanText.match(/(?:direcci[oó]n|dir|mandar a|llevar a|enviar a|calle)[:\s]+([^,\n.]+?)(?:[\n,]|pago|tel|con|paga|\.|$)/i);
  if (addressMatch && addressMatch[1]) {
    const rawDir = addressMatch[1].trim();
    if (rawDir.length > 2) {
      cliente.direccion = rawDir;
    }
  }

  // 5. Payment Method & Cash change
  if (normalized.includes('debito')) {
    pago.metodo = 'debito';
    pago.tarjetaTipo = 'debito';
    pago.tarjetaSello = 'Visa';
  } else if (normalized.includes('credito') || normalized.includes('tarjeta') || normalized.includes('pos')) {
    pago.metodo = 'credito';
    pago.tarjetaTipo = 'credito';
    pago.tarjetaSello = 'Visa';
  } else if (normalized.includes('transferencia') || normalized.includes('transf') || normalized.includes('banco')) {
    pago.metodo = 'transferencia';
  } else if (normalized.includes('a confirmar') || normalized.includes('confirmo')) {
    pago.metodo = 'a confirmar';
  } else {
    pago.metodo = 'efectivo';
  }

  const abonoMatch = cleanText.match(/(?:pago con|abona con|paga con|con billete de|billete de|con)[:\s]*\$?\s*(\d{3,5})/i);
  if (abonoMatch && abonoMatch[1]) {
    pago.abono = abonoMatch[1];
  }

  // 6. Kitchen observations
  const obsKeywords = [
    { key: 'bien tostada', label: 'BIEN TOSTADA' },
    { key: 'bien dorada', label: 'BIEN DORADA' },
    { key: 'bien cocida', label: 'BIEN COCIDA' },
    { key: 'mozzarella del medio', label: 'MOZZARELLA DEL MEDIO' },
    { key: 'mozza del medio', label: 'MOZZARELLA DEL MEDIO' },
    { key: 'mozzarella del orillo', label: 'MOZZARELLA DEL ORILLO' },
    { key: 'masa fina', label: 'MASA FINA' },
    { key: 'sin oregano', label: 'SIN ORÉGANO' },
    { key: 'sin cebolla', label: 'SIN CEBOLLA' },
    { key: 'poco queso', label: 'POCO QUESO' },
    { key: 'cortar en 8', label: 'CORTAR EN 8' },
    { key: 'cortar en 4', label: 'CORTAR EN 4' },
    { key: 'tocar timbre', label: 'TOCAR TIMBRE' },
  ];

  obsKeywords.forEach(obs => {
    if (normalized.includes(obs.key)) {
      if (!detectedObservations.includes(obs.label)) {
        detectedObservations.push(obs.label);
      }
    }
  });

  // 7. MULTI-ITEM DETECTION PIPELINE
  // We split the user speech into segments or scan patterns for all products in the menu
  
  // Product definitions with regex patterns for robust matching
  const productMatchers: {
    patterns: RegExp[];
    itemFinder: () => MenuItem | undefined;
    defaultGustos?: string[];
  }[] = [
    // 1 Metro Muzzarella
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:metros?|m)\s*(?:de\s*)?(?:pizza\s*)?(?:muzzarella|mozzarella|muzza|moza)/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?1\s*metro\s*(?:pizza\s*)?(?:muzzarella|mozzarella|muzza|moza)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('1 metro pizza muzzarella')) || menuItems.find(m => m.id === 'p5'),
    },
    // 1/2 Metro Muzzarella
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?(?:1\/2|medio|media)\s*(?:metro|m)\s*(?:de\s*)?(?:pizza\s*)?(?:muzzarella|mozzarella|muzza|moza)/i,
        /(?:(\d+|un|una|uno|dos|tres)\s*)?1\/2\s*metro\s*muzzarella/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('1/2 metro pizza muzzarella')) || menuItems.find(m => m.id === 'p3'),
    },
    // 1 Metro Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos)\s*)?(?:metros?|1\s*metro)\s*(?:de\s*)?(?:pizza\s*)?comun/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('1 metro pizza comun')) || menuItems.find(m => m.id === 'p6'),
    },
    // 1/2 Metro Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos)\s*)?(?:1\/2|medio)\s*metro\s*(?:de\s*)?(?:pizza\s*)?comun/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('1/2 metro pizza comun')) || menuItems.find(m => m.id === 'p4'),
    },
    // Pizzeta Calabresa
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?pizzetas?\s*(?:de\s*)?calabresa/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?calabresa/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('calabresa')) || menuItems.find(m => m.id === 'pz3'),
    },
    // Pizzeta Napolitana
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?pizzetas?\s*(?:de\s*)?napolitana/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?napolitana/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('pizzeta napolitana')) || menuItems.find(m => m.id === 'pz2'),
    },
    // Pizzeta 4 Quesos
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?pizzetas?\s*(?:de\s*)?(?:4|cuatro)\s*quesos/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?(?:4|cuatro)\s*quesos/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('4 quesos')) || menuItems.find(m => m.id === 'pz4'),
    },
    // Pizzeta Hawaiana
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?pizzetas?\s*(?:de\s*)?hawaiana/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('hawaiana')) || menuItems.find(m => m.id === 'pz5'),
    },
    // Pizzeta Americana
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?pizzetas?\s*(?:de\s*)?americana/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('americana')) || menuItems.find(m => m.id === 'pz6'),
    },
    // Pizzeta Roquefort y Cebolla
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?pizzetas?\s*(?:de\s*)?roquefort(?:\s*y\s*cebolla)?/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('roquefort y cebolla')) || menuItems.find(m => m.id === 'pz7'),
    },
    // Pizzeta Rúcula y Tomate
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?pizzetas?\s*(?:de\s*)?rucula(?:\s*y\s*tomate)?/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('rucula')) || menuItems.find(m => m.id === 'pz8'),
    },
    // Pizzeta Jamón y Champiñones
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?pizzetas?\s*(?:de\s*)?jamon\s*y\s*champinones/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('champinones')) || menuItems.find(m => m.id === 'pz9'),
    },
    // Pizzeta Muzzarella
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s*)?pizzetas?\s*(?:de\s*)?(?:muzzarella|mozzarella|muzza|moza)/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s*)?pizzetas?(?!\s*comun)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('pizzeta muzzarella')) || menuItems.find(m => m.id === 'pz1'),
    },
    // Pizzeta Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?pizzetas?\s*comun/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('pizzeta comun')) || menuItems.find(m => m.id === 'pz10'),
    },
    // Porción Muzzarella
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?porcion(?:es)?\s*(?:de\s*)?(?:muzzarella|mozzarella|muzza|moza)/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?(?:de\s*)?muzza\s*al\s*corte/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('(porcion) muzzarella')) || menuItems.find(m => m.id === 'p1'),
    },
    // Porción Pizza Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis)\s*)?porcion(?:es)?\s*(?:de\s*)?(?:pizza\s*)?comun/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('(porcion) pizza comun')) || menuItems.find(m => m.id === 'p2'),
    },
    // Fainá con Queso
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s*)?fainas?\s*(?:con\s*queso|con\s*muzza|con\s*muzzarella)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('faina con queso')) || menuItems.find(m => m.id === 'f2'),
    },
    // Fainá Orilla
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s*)?fainas?\s*(?:de\s*)?orilla/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('faina orilla')) || menuItems.find(m => m.id === 'f3'),
    },
    // Fainá Centro
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s*)?fainas?\s*(?:de\s*)?centro/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('faina centro')) || menuItems.find(m => m.id === 'f4'),
    },
    // Fainá Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho)\s*)?fainas?\s*(?:comun)?(?!\s*con\s*queso|\s*de\s*orilla|\s*de\s*centro)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('faina comun')) || menuItems.find(m => m.id === 'f1'),
    },
    // Sándwich Caliente con Muzzarella
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro|cinco)\s*)?(?:sandwiches?|sandwich)\s*calientes?\s*con\s*(?:muzzarella|mozzarella|muzza|moza|queso)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('sandwich caliente con muzzarella')) || menuItems.find(m => m.id === 's2'),
    },
    // Sándwich Napolitano
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:sandwiches?|sandwich)\s*napolitano/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('sandwich napolitano')) || menuItems.find(m => m.id === 's3'),
    },
    // Sándwich Caliente Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:sandwiches?|sandwich)\s*calientes?(?!\s*con\s*muzzarella|\s*napolitano)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('sandwich caliente') && !normalizeSpanish(m.nombre).includes('muzzarella')) || menuItems.find(m => m.id === 's1'),
    },
    // Figazza con Muzzarella
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?figazzas?\s*con\s*(?:muzzarella|mozzarella|muzza|moza)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('figazza con muzzarella')) || menuItems.find(m => m.id === 'fg1'),
    },
    // Figazza Común
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?figazzas?(?!\s*con\s*muzzarella)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('figazza comun')) || menuItems.find(m => m.id === 'fg2'),
    },
    // Promo 1 Metro Muzza + Refresco
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos)\s*)?promos?\s*(?:de\s*)?1\s*metro(?:\s*muzza)?(?:\s*\+\s*refresco)?/i,
        /metro\s*con\s*refresco/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('promo 1 metro')) || menuItems.find(m => m.id === 'pr1'),
    },
    // Promo 2 Pizzetas + Chajá
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos)\s*)?promos?\s*(?:de\s*)?2\s*pizzetas/i,
        /2\s*pizzetas\s*mas\s*chaja/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('promo 2 pizzetas')) || menuItems.find(m => m.id === 'pr2'),
    },
    // Promo 2 Fainás + 2 Porciones Muzza
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos)\s*)?promos?\s*(?:de\s*)?2\s*fainas/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('promo 2 fainas')) || menuItems.find(m => m.id === 'pr3'),
    },
    // Refresco 1.5 L (Coca-Cola, Sprite, etc.)
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:refrescos?|coca\s*cola|coca|sprite|fanta|pomelo)\s*(?:de\s*)?(?:1\.5|litro\s*y\s*medio|grande)/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?coca\s*(?:de\s*)?1\.5/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?refresco\s*1\.5/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('refresco 1.5')) || menuItems.find(m => m.id === 'b1'),
    },
    // Refresco 600 ML
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:refrescos?|coca\s*cola|coca|sprite|fanta)\s*(?:de\s*)?(?:600|chica|individual)/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?coca\s*600/i,
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?refresco\s*600/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('refresco 600')) || menuItems.find(m => m.id === 'b2'),
    },
    // Cerveza Patricia 1L
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:cervezas?\s*)?patricia(?:\s*(?:de\s*)?1\s*l(?:itro)?)?/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('patricia')) || menuItems.find(m => m.id === 'b5'),
    },
    // Cerveza Stella Artois 1L
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:cervezas?\s*)?stella(?:\s*artois)?/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('stella')) || menuItems.find(m => m.id === 'b6'),
    },
    // Cerveza Zillertal 1L
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:cervezas?\s*)?zillertal/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('zillertal')) || menuItems.find(m => m.id === 'b7'),
    },
    // Cerveza Pilsen 1L
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:cervezas?\s*)?pilsen/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('pilsen')) || menuItems.find(m => m.id === 'b8'),
    },
    // Cerveza Corona 330ML
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:cervezas?\s*)?corona/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('corona')) || menuItems.find(m => m.id === 'b9'),
    },
    // Salus Frutte 600ML
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?salus\s*frutte/i,
        /(?:(\d+|un|una|uno|dos|tres)\s*)?frutte/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('salus frutte')) || menuItems.find(m => m.id === 'b10'),
    },
    // Agua Salus 1.5L
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?agua\s*(?:salus\s*)?(?:de\s*)?(?:1\.5|litro\s*y\s*medio|grande)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('agua salus 1.5')) || menuItems.find(m => m.id === 'b3'),
    },
    // Agua Salus 600ML
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?agua\s*(?:salus\s*)?(?:de\s*)?(?:600|chica|individual)/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('agua salus 600')) || menuItems.find(m => m.id === 'b4'),
    },
    // Postre Chajá
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres|cuatro)\s*)?(?:postres?\s*)?chaja/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('chaja')) || menuItems.find(m => m.id === 'po1'),
    },
    // Helado
    {
      patterns: [
        /(?:(\d+|un|una|uno|dos|tres)\s*)?helados?/i,
      ],
      itemFinder: () => menuItems.find(m => normalizeSpanish(m.nombre).includes('helado')) || menuItems.find(m => m.id === 'po2'),
    },
  ];

  // Detect Gustos / Toppings mentioned anywhere in the sentence
  const foundGlobalGustos: Gusto[] = [];
  gustosList.forEach((g) => {
    const gNorm = normalizeSpanish(g.nombre);
    if (
      normalized.includes(gNorm) || 
      (gNorm.includes('panceta') && normalized.includes('panceta')) ||
      (gNorm.includes('aceitunas') && (normalized.includes('aceitunas') || normalized.includes('aceituna'))) ||
      (gNorm.includes('morrones') && (normalized.includes('morrones') || normalized.includes('morron'))) ||
      (gNorm.includes('huevo') && normalized.includes('huevo')) ||
      (gNorm.includes('extra muzzarella') && (normalized.includes('extra muzza') || normalized.includes('doble muzza') || normalized.includes('extra queso'))) ||
      (gNorm.includes('palmitos') && normalized.includes('palmito')) ||
      (gNorm.includes('roquefort') && (normalized.includes('roquefort') || normalized.includes('queso azul'))) ||
      (gNorm.includes('salamin') && (normalized.includes('salamin') || normalized.includes('salame'))) ||
      (gNorm.includes('champinones') && (normalized.includes('champinon') || normalized.includes('hongos'))) ||
      (gNorm.includes('anana') && (normalized.includes('anana') || normalized.includes('pina'))) ||
      (gNorm.includes('cebolla') && normalized.includes('cebolla'))
    ) {
      if (!foundGlobalGustos.some(fg => fg.id === g.id)) {
        foundGlobalGustos.push(g);
      }
    }
  });

  // Match items iteratively
  productMatchers.forEach(matcher => {
    for (const pattern of matcher.patterns) {
      const match = normalized.match(pattern);
      if (match) {
        let cant = 1;
        if (match[1]) {
          const numRaw = match[1].toLowerCase().trim();
          if (SPANISH_NUMBERS[numRaw]) {
            cant = SPANISH_NUMBERS[numRaw];
          } else if (!isNaN(Number(numRaw))) {
            cant = Math.max(1, parseInt(numRaw, 10));
          }
        }

        const item = matcher.itemFinder();
        if (item) {
          const isPizza = item.categoria === 'pizzas' || item.categoria === 'pizzetas' || item.categoria === 'figazza' || item.categoria === 'promos';
          const applicableGustos = isPizza ? foundGlobalGustos : [];
          const extraPrice = applicableGustos.reduce((sum, g) => sum + g.precio, 0);
          const unitPrice = item.precio + extraPrice;
          const notasGustos = applicableGustos.map(g => g.nombre).join(', ');

          const alreadyInCart = cart.some(c => c.id === item.id);
          if (!alreadyInCart) {
            cart.push({
              ...item,
              cantidad: cant,
              precioUnitario: unitPrice,
              precio: unitPrice,
              notas: notasGustos ? `+ ${notasGustos}` : '',
              gustos: applicableGustos,
            });
          }
          break; // Matched this item
        }
      }
    }
  });

  // Fallback: If only "una pizza" or "una muzza" was mentioned with no specific matcher
  if (cart.length === 0 && (normalized.includes('pizza') || normalized.includes('muzza') || normalized.includes('mozzarella'))) {
    const muzzaItem = menuItems.find(m => m.id === 'pz1' || normalizeSpanish(m.nombre).includes('pizzeta muzzarella')) || menuItems[0];
    if (muzzaItem) {
      const extraPrice = foundGlobalGustos.reduce((sum, g) => sum + g.precio, 0);
      const unitPrice = muzzaItem.precio + extraPrice;
      cart.push({
        ...muzzaItem,
        cantidad: 1,
        precioUnitario: unitPrice,
        precio: unitPrice,
        notas: foundGlobalGustos.length > 0 ? `+ ${foundGlobalGustos.map(g => g.nombre).join(', ')}` : '',
        gustos: foundGlobalGustos,
      });
    }
  }

  const itemsSummary = cart.map(c => `${c.cantidad}x ${c.nombre}${c.notas ? ` (${c.notas})` : ''}`).join(', ');
  const obsSummary = detectedObservations.length > 0 ? ` [Notas: ${detectedObservations.join(', ')}]` : '';
  const resumen = `Comanda (${pago.tipo.toUpperCase()}): ${itemsSummary || 'Sin productos claros'}.${obsSummary} Cliente: ${cliente.nombre || 'Consumidor'}, Pago: ${pago.metodo}${pago.abono ? ` (Abona $${pago.abono})` : ''}.`;

  return {
    cart,
    cliente,
    pago,
    resumen,
    source: 'local_smart',
    rawText: cleanText,
    observaciones: detectedObservations.join(', '),
  };
}

// Master parsing function: Attempts Gemini server endpoint first, then local fallback
export async function parseOrderWithAI(
  text: string,
  menuItems: MenuItem[],
  gustosList: Gusto[] = gustosAdicionales
): Promise<ParsedOrderResult> {
  if (!text || text.trim() === '') {
    throw new Error('El texto no puede estar vacío');
  }

  try {
    const response = await fetch('/api/ai/parse-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        menuItems,
        gustos: gustosList,
      }),
    });

    if (!response.ok) {
      return parseOrderLocally(text, menuItems, gustosList);
    }

    const resJson = await response.json();
    if (!resJson.success || !resJson.data) {
      return parseOrderLocally(text, menuItems, gustosList);
    }

    const aiData = resJson.data;
    const cart: CartItem[] = [];

    // Map AI items to real menu items
    if (Array.isArray(aiData.productos)) {
      aiData.productos.forEach((p: any) => {
        let matchedItem: MenuItem | undefined;

        if (p.id) {
          matchedItem = menuItems.find(m => String(m.id) === String(p.id));
        }
        if (!matchedItem && p.nombre) {
          const pNameNorm = normalizeSpanish(p.nombre);
          matchedItem = menuItems.find(m => normalizeSpanish(m.nombre) === pNameNorm) ||
                        menuItems.find(m => normalizeSpanish(m.nombre).includes(pNameNorm) || pNameNorm.includes(normalizeSpanish(m.nombre)));
        }

        if (matchedItem) {
          const matchedGustos: Gusto[] = [];
          if (Array.isArray(p.gustosNombres)) {
            p.gustosNombres.forEach((gn: string) => {
              const gustoFound = gustosList.find(g => normalizeSpanish(g.nombre) === normalizeSpanish(gn) || normalizeSpanish(gn).includes(normalizeSpanish(g.nombre)));
              if (gustoFound && !matchedGustos.some(mg => mg.id === gustoFound.id)) {
                matchedGustos.push(gustoFound);
              }
            });
          }

          const gustosPrice = matchedGustos.reduce((s, g) => s + g.precio, 0);
          const unitPrice = matchedItem.precio + gustosPrice;
          const notasGustos = matchedGustos.map(g => g.nombre).join(', ');

          cart.push({
            ...matchedItem,
            cantidad: Math.max(1, p.cantidad || 1),
            precioUnitario: unitPrice,
            precio: unitPrice,
            notas: p.notas ? p.notas : (notasGustos ? `+ ${notasGustos}` : ''),
            gustos: matchedGustos,
          });
        }
      });
    }

    // If Gemini didn't return matches or had an issue, fallback to local parser
    if (cart.length === 0) {
      return parseOrderLocally(text, menuItems, gustosList);
    }

    const cliente: OrderClient = {
      nombre: aiData.cliente?.nombre ? aiData.cliente.nombre.toUpperCase() : '',
      mesa: aiData.cliente?.mesa || '',
      telefono: aiData.cliente?.telefono || '',
      direccion: aiData.cliente?.direccion || '',
    };

    const rawTipo = (aiData.pago?.tipo || 'local').toLowerCase();
    const tipo = ['envio', 'mesa', 'local'].includes(rawTipo) ? rawTipo : 'local';

    const rawMetodo = (aiData.pago?.metodo || 'efectivo').toLowerCase();
    const metodo = ['efectivo', 'debito', 'credito', 'transferencia', 'a confirmar'].includes(rawMetodo) ? rawMetodo : 'efectivo';

    const pago: OrderPayment = {
      tipo,
      metodo,
      notas: aiData.pago?.notas || '',
      programado: false,
      horaProgramada: '',
      abono: aiData.pago?.abono ? String(aiData.pago.abono) : '',
      propina: aiData.pago?.propina ? String(aiData.pago.propina) : '',
      cadete: 'Samuel',
      tarjetaTipo: metodo === 'debito' || metodo === 'credito' ? (metodo as any) : undefined,
      tarjetaSello: metodo === 'debito' || metodo === 'credito' ? 'Visa' : undefined,
    };

    return {
      cart,
      cliente,
      pago,
      resumen: aiData.resumen || `Pedido procesado por IA con ${cart.length} productos.`,
      source: 'gemini',
      rawText: text,
      observaciones: aiData.observaciones || '',
    };
  } catch (err) {
    return parseOrderLocally(text, menuItems, gustosList);
  }
}
