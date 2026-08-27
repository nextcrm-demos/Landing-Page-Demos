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
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Supercharged Spanish POS Order Parser
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

  // 4. Try matching existing client from clients list
  if (clientsList && Array.isArray(clientsList) && clientsList.length > 0) {
    if (cliente.telefono) {
      const matchClient = clientsList.find(c => c && c.telefono && c.telefono.replace(/\D/g, '') === cliente.telefono);
      if (matchClient) {
        if (!cliente.nombre && matchClient.nombre) cliente.nombre = matchClient.nombre;
        if (!cliente.direccion && matchClient.direccion) cliente.direccion = matchClient.direccion;
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

  // 7. Detect Gustos / Toppings mentioned anywhere in the sentence
  const foundGlobalGustos: Gusto[] = [];
  if (Array.isArray(gustosList)) {
    gustosList.forEach((g) => {
      if (!g || !g.nombre) return;
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
  }

  // Match menu products
  if (Array.isArray(menuItems)) {
    menuItems.forEach(item => {
      if (!item || !item.nombre) return;
      const itemNorm = normalizeSpanish(item.nombre);
      if (normalized.includes(itemNorm)) {
        // Detect quantity
        const regex = new RegExp(`(\\d+|un|una|dos|tres|cuatro|cinco|seis)\\s*(?:de\\s*)?${itemNorm}`, 'i');
        const m = normalized.match(regex);
        let cant = 1;
        if (m && m[1]) {
          const rawNum = m[1].toLowerCase().trim();
          cant = SPANISH_NUMBERS[rawNum] || parseInt(rawNum, 10) || 1;
        }

        const isPizza = itemNorm.includes('pizza') || itemNorm.includes('pizzeta') || itemNorm.includes('metro') || itemNorm.includes('muzza');
        const gustosForThis = isPizza ? [...foundGlobalGustos] : [];
        const gustosTotal = gustosForThis.reduce((s, g) => s + (g.precio || 0), 0);
        const itemPrice = (item.precio || 0) + gustosTotal;

        cart.push({
          id: item.id || `cart-${Date.now()}-${Math.random()}`,
          productoId: item.id || '',
          nombre: item.nombre,
          precio: itemPrice,
          cantidad: cant,
          categoria: item.categoria || 'Pizzas',
          gustos: gustosForThis,
          notas: gustosForThis.length > 0 ? `+ ${gustosForThis.map(g => g.nombre).join(', ')}` : '',
        });
      }
    });
  }

  // Fallback default item if none matched
  if (cart.length === 0 && (normalized.includes('pizza') || normalized.includes('muzza') || normalized.includes('mozzarella'))) {
    const muzzaProduct = menuItems.find(m => normalizeSpanish(m.nombre).includes('muzza')) || {
      id: 'prod-1',
      nombre: '1 Metro Pizza Muzzarella',
      precio: 850,
      categoria: 'Pizzas',
    };

    const gustosTotal = foundGlobalGustos.reduce((s, g) => s + (g.precio || 0), 0);
    cart.push({
      id: `cart-${Date.now()}`,
      productoId: muzzaProduct.id,
      nombre: muzzaProduct.nombre,
      precio: muzzaProduct.precio + gustosTotal,
      cantidad: 1,
      categoria: 'Pizzas',
      gustos: foundGlobalGustos,
      notas: foundGlobalGustos.length > 0 ? `+ ${foundGlobalGustos.map(g => g.nombre).join(', ')}` : '',
    });
  }

  const resumen = `Comanda de ${cart.reduce((a, b) => a + b.cantidad, 0)} productos para ${pago.tipo.toUpperCase()}${cliente.nombre ? ` (${cliente.nombre})` : ''}. Total: $${cart.reduce((a, b) => a + b.precio * b.cantidad, 0)}`;

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

export async function parseOrderWithAI(
  text: string,
  menuItems: MenuItem[],
  gustosList: Gusto[] = gustosAdicionales
): Promise<ParsedOrderResult> {
  return parseOrderLocally(text, menuItems, gustosList);
}
