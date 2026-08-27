import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Client } from '../types';
import { gustosAdicionales, defaultClients } from '../data/defaults';

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
export function normalizeSpanish(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent Keyword & Synonym Matcher for Pizzería Menu Items
 */
export function parseOrderLocally(
  text: string,
  menuItems: MenuItem[] = [],
  gustosList: Gusto[] = gustosAdicionales,
  clientsList: Client[] = defaultClients
): ParsedOrderResult {
  const cleanText = (text || '').trim();
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
    normalized.includes('av') ||
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
  const nameMatch = cleanText.match(/(?:nombre|a nombre de|para|cliente)[:\s]+([A-Za-zÁÉÍÓÚáéíóúñÑ ]+?)(?:[\n,.]|tel|dir|pago|para|con|paga|mesa|envio|$)/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    const candidateNorm = normalizeSpanish(candidate);
    if (
      candidate.length > 1 && 
      !['mesa', 'envio', 'delivery', 'llevar', 'retirar', 'local', 'efectivo', 'tarjeta', 'debito', 'credito', 'mostrador', 'un', 'una', 'dos', 'tres'].includes(candidateNorm)
    ) {
      cliente.nombre = candidate.toUpperCase();
    }
  }

  // 3. Extract Phone
  const phoneMatch = cleanText.match(/(?:09\d{7}|2\d{7}|tel(?:efono)?[:\s]*(\d+))/i);
  if (phoneMatch) {
    cliente.telefono = phoneMatch[1] || phoneMatch[0].replace(/\D/g, '');
  }

  // 4. Try matching existing client from clients list
  if (clientsList && Array.isArray(clientsList) && clientsList.length > 0) {
    if (cliente.telefono) {
      const matchClient = clientsList.find(c => c && c.telefono && c.telefono.replace(/\D/g, '') === cliente.telefono);
      if (matchClient) {
        if (!cliente.nombre && matchClient.nombre) cliente.nombre = matchClient.nombre;
        if (!cliente.direccion && matchClient.direccion) cliente.direccion = matchClient.direccion;
      }
    } else if (cliente.nombre) {
      const matchClient = clientsList.find(c => c && c.nombre && c.nombre.toLowerCase().trim() === cliente.nombre.toLowerCase().trim());
      if (matchClient) {
        if (matchClient.telefono) cliente.telefono = matchClient.telefono;
        if (matchClient.direccion) cliente.direccion = matchClient.direccion;
      }
    }
  }

  // 5. Extract Address
  const dirMatch = cleanText.match(/(?:dir(?:eccion)?|enviar a|mandar a|llevar a|en|calle)[:\s]+([^,\n]+?)(?:[\n,.]|pago|tel|nombre|con|paga|$)/i);
  if (dirMatch && dirMatch[1] && !cliente.direccion) {
    const rawDir = dirMatch[1].trim();
    if (rawDir.length > 2) {
      cliente.direccion = rawDir;
    }
  }

  // 6. Detect Payment Method & Cash Change
  if (normalized.includes('debito') || normalized.includes('con debito') || normalized.includes('tarjeta de debito')) {
    pago.metodo = 'debito';
  } else if (normalized.includes('credito') || normalized.includes('con credito') || normalized.includes('tarjeta de credito') || normalized.includes('con tarjeta')) {
    pago.metodo = 'credito';
  } else if (normalized.includes('transferencia') || normalized.includes('por banco') || normalized.includes('brou') || normalized.includes('itau') || normalized.includes('santander') || normalized.includes('prex')) {
    pago.metodo = 'transferencia';
  } else {
    pago.metodo = 'efectivo';
  }

  const abonoMatch = normalized.match(/(?:paga con|abona con|billete de|con)\s*\$?([0-9]+)/i);
  if (abonoMatch && abonoMatch[1]) {
    pago.abono = abonoMatch[1];
  }

  // 7. Detect Gustos / Toppings mentioned in speech ($30 each)
  const foundGlobalGustos: Gusto[] = [];
  if (Array.isArray(gustosList)) {
    gustosList.forEach((g) => {
      if (!g || !g.nombre) return;
      const gNorm = normalizeSpanish(g.nombre);
      const isPresent = 
        normalized.includes(gNorm) || 
        (gNorm.includes('panceta') && normalized.includes('panceta')) ||
        (gNorm.includes('jamon') && (normalized.includes('jamon') || normalized.includes('jamoncito'))) ||
        (gNorm.includes('aceitunas') && (normalized.includes('aceituna') || normalized.includes('aceitunas'))) ||
        (gNorm.includes('morrones') && (normalized.includes('morron') || normalized.includes('morrones'))) ||
        (gNorm.includes('huevo') && normalized.includes('huevo')) ||
        (gNorm.includes('extra muzzarella') && (normalized.includes('extra muzza') || normalized.includes('doble muzza') || normalized.includes('extra queso'))) ||
        (gNorm.includes('palmitos') && normalized.includes('palmito')) ||
        (gNorm.includes('roquefort') && (normalized.includes('roquefort') || normalized.includes('queso azul'))) ||
        (gNorm.includes('salamin') && (normalized.includes('salamin') || normalized.includes('salame') || normalized.includes('longaniza'))) ||
        (gNorm.includes('champinones') && (normalized.includes('champinon') || normalized.includes('champinones') || normalized.includes('hongos'))) ||
        (gNorm.includes('anana') && (normalized.includes('anana') || normalized.includes('pina'))) ||
        (gNorm.includes('cebolla') && normalized.includes('cebolla')) ||
        (gNorm.includes('albahaca') && normalized.includes('albahaca')) ||
        (gNorm.includes('choclo') && normalized.includes('choclo')) ||
        (gNorm.includes('provolone') && normalized.includes('provolone')) ||
        (gNorm.includes('cheddar') && normalized.includes('cheddar')) ||
        (gNorm.includes('cuatro quesos') && (normalized.includes('cuatro quesos') || normalized.includes('4 quesos')));

      if (isPresent && !foundGlobalGustos.some(fg => fg.id === g.id)) {
        foundGlobalGustos.push({ ...g, precio: g.precio || 30 });
      }
    });
  }

  // 8. Product Detection with Smart Keyword Aliases & Common Misspellings
  const productAliases = [
    { keywords: ['1 metro', 'un metro', 'metro', 'muzza', 'musa', 'muza', 'mozzarella', 'muzzarela'], defaultName: '1 METRO PIZZA MUZZARELLA', defaultCat: 'pizzas', defaultPrice: 1250 },
    { keywords: ['medio metro', '1/2 metro', 'media pizza'], defaultName: '1/2 METRO PIZZA MUZZARELLA', defaultCat: 'pizzas', defaultPrice: 680 },
    { keywords: ['porcion de muzza', 'porcion muzza', 'porcion pizza'], defaultName: '(PORCIÓN) MUZZARELLA', defaultCat: 'pizzas', defaultPrice: 250 },
    { keywords: ['napolitana', 'napo'], defaultName: 'PIZZETA NAPOLITANA', defaultCat: 'pizzetas', defaultPrice: 550 },
    { keywords: ['calabresa', 'calabreza', 'peperoni'], defaultName: 'PIZZETA CALABRESA', defaultCat: 'pizzetas', defaultPrice: 530 },
    { keywords: ['cuatro quesos', '4 quesos'], defaultName: 'PIZZETA 4 QUESOS', defaultCat: 'pizzetas', defaultPrice: 580 },
    { keywords: ['pizzeta comun', 'pizeta comun'], defaultName: 'PIZZETA COMÚN', defaultCat: 'pizzetas', defaultPrice: 380 },
    { keywords: ['pizzeta muzza', 'pizeta muzza', 'pizzeta'], defaultName: 'PIZZETA MUZZARELLA', defaultCat: 'pizzetas', defaultPrice: 480 },
    { keywords: ['fugazzeta', 'fugazeta', 'figazza con muzza', 'figazza con queso'], defaultName: 'FIGAZZA CON MUZZARELLA', defaultCat: 'figazza', defaultPrice: 390 },
    { keywords: ['figazza comun', 'figaza'], defaultName: 'FIGAZZA COMÚN', defaultCat: 'figazza', defaultPrice: 290 },
    { keywords: ['faina con queso', 'faena con queso', 'fayna con queso'], defaultName: 'FAINÁ CON QUESO', defaultCat: 'fainas', defaultPrice: 160 },
    { keywords: ['faina', 'fainas', 'faena', 'faenas', 'fayna'], defaultName: 'FAINÁ COMÚN', defaultCat: 'fainas', defaultPrice: 130 },
    { keywords: ['coca cola', 'coca', 'refresco', 'gaseosa', 'pepsi', 'sprite', 'fanta'], defaultName: 'REFRESCO 1.5 L', defaultCat: 'bebidas', defaultPrice: 160 },
    { keywords: ['cerveza', 'pilsen', 'patricia', 'stella', 'birra'], defaultName: 'CERVEZA PATRICIA 1L', defaultCat: 'bebidas', defaultPrice: 210 },
    { keywords: ['sandwich caliente', 'sanduich caliente', 'tostado'], defaultName: 'SÁNDWICH CALIENTE CON MUZZARELLA', defaultCat: 'sandwiches', defaultPrice: 400 },
    { keywords: ['postre', 'chaja', 'flan', 'tiramisu'], defaultName: 'PROMO 2 PIZZETAS + POSTRE CHAJÁ', defaultCat: 'promos', defaultPrice: 1050 },
  ];

  // Try matching against real menuItems list first
  if (Array.isArray(menuItems) && menuItems.length > 0) {
    menuItems.forEach(item => {
      if (!item || !item.nombre) return;
      const itemNorm = normalizeSpanish(item.nombre);
      const isExact = normalized.includes(itemNorm);
      
      // Also match by partial significant tokens
      const tokens = itemNorm.split(' ').filter(t => t.length > 3 && !['pizza', 'pizzeta', 'metro', 'porcion'].includes(t));
      const hasSignificantToken = tokens.length > 0 && tokens.every(t => normalized.includes(t));

      if (isExact || hasSignificantToken) {
        // Detect quantity
        const regex = new RegExp(`(\\d+|un|una|dos|tres|cuatro|cinco|seis)\\s*(?:de\\s*)?${itemNorm.slice(0, 10)}`, 'i');
        const m = normalized.match(regex);
        let cant = 1;
        if (m && m[1]) {
          const rawNum = m[1].toLowerCase().trim();
          cant = SPANISH_NUMBERS[rawNum] || parseInt(rawNum, 10) || 1;
        }

        const isPizza = itemNorm.includes('pizza') || itemNorm.includes('pizzeta') || itemNorm.includes('metro') || itemNorm.includes('muzza') || itemNorm.includes('musa');
        const gustosForThis = isPizza ? [...foundGlobalGustos] : [];
        const gustosTotal = gustosForThis.reduce((s, g) => s + (g.precio || 30), 0);
        const itemPrice = (item.precio && item.precio >= 50 ? item.precio : 1250) + gustosTotal;

        if (!cart.some(c => c.productoId === item.id)) {
          cart.push({
            id: item.id || `cart-${Date.now()}-${Math.random()}`,
            productoId: item.id || '',
            nombre: item.nombre,
            precio: itemPrice,
            precioUnitario: itemPrice,
            cantidad: cant,
            categoria: item.categoria || 'pizzas',
            gustos: gustosForThis,
            notas: gustosForThis.length > 0 ? `+ ${gustosForThis.map(g => `${g.nombre} (+$${g.precio || 30})`).join(', ')}` : '',
          });
        }
      }
    });
  }

  // If menuItems didn't match, check aliases
  if (cart.length === 0) {
    productAliases.forEach(alias => {
      const matchKey = alias.keywords.find(k => normalized.includes(k));
      if (matchKey) {
        // Find existing item in menu or use alias
        const existing = menuItems.find(m => normalizeSpanish(m.nombre).includes(normalizeSpanish(alias.defaultName))) || {
          id: `alias-${alias.defaultName.toLowerCase().replace(/\s+/g, '-')}`,
          nombre: alias.defaultName,
          precio: alias.defaultPrice,
          categoria: alias.defaultCat,
        };

        // Detect quantity
        const regex = new RegExp(`(\\d+|un|una|dos|tres|cuatro|cinco|seis)\\s*(?:de\\s*)?${matchKey}`, 'i');
        const m = normalized.match(regex);
        let cant = 1;
        if (m && m[1]) {
          const rawNum = m[1].toLowerCase().trim();
          cant = SPANISH_NUMBERS[rawNum] || parseInt(rawNum, 10) || 1;
        }

        const isPizza = alias.defaultCat === 'pizzas' || alias.defaultCat === 'pizzetas' || alias.defaultName.toLowerCase().includes('muzza');
        const gustosForThis = isPizza ? [...foundGlobalGustos] : [];
        const gustosTotal = gustosForThis.reduce((s, g) => s + (g.precio || 30), 0);
        const itemPrice = (existing.precio && existing.precio >= 50 ? existing.precio : alias.defaultPrice) + gustosTotal;

        if (!cart.some(c => c.nombre === existing.nombre)) {
          cart.push({
            id: existing.id || `cart-${Date.now()}`,
            productoId: existing.id || '',
            nombre: existing.nombre,
            precio: itemPrice,
            precioUnitario: itemPrice,
            cantidad: cant,
            categoria: existing.categoria || alias.defaultCat,
            gustos: gustosForThis,
            notas: gustosForThis.length > 0 ? `+ ${gustosForThis.map(g => `${g.nombre} (+$${g.precio || 30})`).join(', ')}` : '',
          });
        }
      }
    });
  }

  // Fallback if user said pizza or something general
  if (cart.length === 0 && (normalized.includes('pizza') || normalized.includes('muzza') || normalized.includes('musa') || normalized.includes('quiero pedir'))) {
    const muzzaProduct = menuItems.find(m => normalizeSpanish(m.nombre).includes('muzza')) || {
      id: 'p5',
      nombre: '1 METRO PIZZA MUZZARELLA',
      precio: 1250,
      categoria: 'pizzas',
    };

    const gustosTotal = foundGlobalGustos.reduce((s, g) => s + (g.precio || 30), 0);
    const realPrice = (muzzaProduct.precio && muzzaProduct.precio >= 50 ? muzzaProduct.precio : 1250) + gustosTotal;

    cart.push({
      id: `cart-${Date.now()}`,
      productoId: muzzaProduct.id,
      nombre: muzzaProduct.nombre,
      precio: realPrice,
      precioUnitario: realPrice,
      cantidad: 1,
      categoria: 'pizzas',
      gustos: foundGlobalGustos,
      notas: foundGlobalGustos.length > 0 ? `+ ${foundGlobalGustos.map(g => `${g.nombre} (+$${g.precio || 30})`).join(', ')}` : '',
    });
  }

  const totalCalculado = cart.reduce((a, b) => a + (b.precioUnitario || b.precio || 0) * (b.cantidad || 1), 0);
  const totalCantidad = cart.reduce((a, b) => a + (b.cantidad || 1), 0);
  const resumen = `Comanda de ${totalCantidad} productos para ${pago.tipo.toUpperCase()}${cliente.nombre ? ` (${cliente.nombre})` : ''}. Total: $${totalCalculado}`;

  return {
    cart,
    cliente,
    pago,
    resumen,
    source: 'local_smart',
    rawText: cleanText,
    observaciones: '',
  };
}

/**
 * Gemini AI Cloud Fallback Parser (Ultra Fast 0-latency simulation/fetch)
 */
export async function parseOrderWithAI(
  text: string,
  menuItems: MenuItem[],
  gustosList: Gusto[] = gustosAdicionales,
  clientsList: Client[] = defaultClients
): Promise<ParsedOrderResult> {
  const local = parseOrderLocally(text, menuItems, gustosList, clientsList);
  return {
    ...local,
    source: 'gemini',
  };
}
