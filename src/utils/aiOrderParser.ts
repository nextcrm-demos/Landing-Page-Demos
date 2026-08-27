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
 * Supercharged POS Order Parser with Exact Disambiguation for Sizes, Pizzas & Beverages
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

  // 7. Detect Gustos / Toppings ($30 each)
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

  // 8. Size / Variant Disambiguation Rules
  const wants15L = normalized.includes('1 5') || normalized.includes('1.5') || normalized.includes('litro y medio') || normalized.includes('1 y medio') || normalized.includes('grande');
  const wants600ML = normalized.includes('600') || normalized.includes('chico') || normalized.includes('chica') || normalized.includes('individual') || normalized.includes('personal');
  const wants1L = (normalized.includes('1 l') || normalized.includes('1 litro') || normalized.includes('de litro') || normalized.includes('litro')) && !wants15L;

  const wantsHalfMetro = normalized.includes('medio metro') || normalized.includes('1/2 metro') || normalized.includes('media pizza') || normalized.includes('media metro');
  const wantsFullMetro = (normalized.includes('un metro') || normalized.includes('1 metro') || normalized.includes('metro')) && !wantsHalfMetro;
  const wantsPizzeta = normalized.includes('pizzeta') || normalized.includes('pizeta');
  const wantsPorcion = normalized.includes('porcion') || normalized.includes('porciones');
  const wantsFainaQueso = normalized.includes('faina con queso') || normalized.includes('faena con queso') || normalized.includes('fayna con queso');
  const wantsFainaComun = (normalized.includes('faina') || normalized.includes('faena') || normalized.includes('fayna')) && !wantsFainaQueso;

  // 9. Score each MenuItem to pick EXACT matches instead of multiple broad matches
  if (Array.isArray(menuItems) && menuItems.length > 0) {
    const scoredItems: { item: MenuItem; score: number; qty: number }[] = [];

    menuItems.forEach(item => {
      if (!item || !item.nombre) return;
      const itemNorm = normalizeSpanish(item.nombre);
      let score = 0;

      // BEVERAGE DISAMBIGUATION
      if (item.categoria === 'bebidas' || itemNorm.includes('refresco') || itemNorm.includes('coca') || itemNorm.includes('agua') || itemNorm.includes('cerveza')) {
        const isRefresco = normalized.includes('refresco') || normalized.includes('coca') || normalized.includes('gaseosa') || normalized.includes('pepsi') || normalized.includes('sprite') || normalized.includes('fanta');
        const isAgua = normalized.includes('agua') || normalized.includes('salus');
        const isCerveza = normalized.includes('cerveza') || normalized.includes('patricia') || normalized.includes('pilsen') || normalized.includes('stella') || normalized.includes('birra');

        if (isRefresco && itemNorm.includes('refresco')) {
          if (wants15L && itemNorm.includes('1.5')) score += 100;
          else if (wants600ML && itemNorm.includes('600')) score += 100;
          else if (!wants15L && !wants600ML && itemNorm.includes('1.5')) score += 80; // default to 1.5L if unspecified
        } else if (isAgua && itemNorm.includes('agua')) {
          if (wants15L && itemNorm.includes('1.5')) score += 100;
          else if (wants600ML && itemNorm.includes('600')) score += 100;
          else if (!wants15L && !wants600ML && itemNorm.includes('1.5')) score += 80;
        } else if (isCerveza && (itemNorm.includes('cerveza') || itemNorm.includes('patricia'))) {
          score += 100;
        }
      }
      
      // PIZZA / PIZZETA / FAINA DISAMBIGUATION
      else if (item.categoria === 'pizzas' || item.categoria === 'pizzetas' || item.categoria === 'fainas' || item.categoria === 'figazza') {
        const isMuzza = normalized.includes('muzza') || normalized.includes('musa') || normalized.includes('muza') || normalized.includes('mozzarella');
        const isNapo = normalized.includes('napolitana') || normalized.includes('napo');
        const isCalabresa = normalized.includes('calabresa') || normalized.includes('calabreza');
        const is4Quesos = normalized.includes('cuatro quesos') || normalized.includes('4 quesos');
        const isFigazza = normalized.includes('figazza') || normalized.includes('fugazzeta') || normalized.includes('fugazeta');

        // FAINA
        if (wantsFainaQueso && itemNorm.includes('faina con queso')) score += 100;
        else if (wantsFainaComun && itemNorm.includes('faina comun')) score += 100;

        // PIZZA 1 METRO
        else if (wantsFullMetro && isMuzza && itemNorm.includes('1 metro pizza muzzarella')) score += 100;
        else if (wantsHalfMetro && isMuzza && itemNorm.includes('1/2 metro pizza muzzarella')) score += 100;
        else if (wantsPorcion && isMuzza && itemNorm.includes('(porcion) muzzarella')) score += 100;

        // PIZZETAS
        else if (wantsPizzeta) {
          if (isNapo && itemNorm.includes('napolitana')) score += 100;
          else if (isCalabresa && itemNorm.includes('calabresa')) score += 100;
          else if (is4Quesos && itemNorm.includes('4 quesos')) score += 100;
          else if (isMuzza && itemNorm.includes('pizzeta muzzarella')) score += 100;
          else if (itemNorm.includes('pizzeta comun')) score += 70;
        }

        // FIGAZZA
        else if (isFigazza) {
          if (isMuzza && itemNorm.includes('figazza con muzzarella')) score += 100;
          else if (itemNorm.includes('figazza comun')) score += 90;
        }

        // Direct item name fallback
        else if (normalized.includes(itemNorm) && itemNorm.length > 5) {
          score += 60;
        }
      }

      // SANDWICHES
      else if (item.categoria === 'sandwiches') {
        if (normalized.includes('sandwich') || normalized.includes('sanduich') || normalized.includes('caliente')) {
          if (normalized.includes('muzza') || normalized.includes('queso')) {
            if (itemNorm.includes('muzzarella')) score += 100;
          } else {
            if (itemNorm.includes('sandwich caliente')) score += 80;
          }
        }
      }

      if (score >= 60) {
        // Detect quantity
        const regex = new RegExp(`(\\d+|un|una|dos|tres|cuatro|cinco|seis)\\s*(?:de\\s*)?`, 'i');
        const m = normalized.match(regex);
        let cant = 1;
        if (m && m[1]) {
          const rawNum = m[1].toLowerCase().trim();
          cant = SPANISH_NUMBERS[rawNum] || parseInt(rawNum, 10) || 1;
        }

        scoredItems.push({ item, score, qty: cant });
      }
    });

    // Sort by score descending and pick only top matched distinct items
    scoredItems.sort((a, b) => b.score - a.score);

    // Filter to avoid adding overlapping items of same category if not requested
    const selectedItemIds = new Set<string | number>();
    scoredItems.forEach(({ item, qty }) => {
      // If we already selected a beverage in this single turn, don't add another beverage unless explicitly multi-item
      if (item.categoria === 'bebidas' && Array.from(selectedItemIds).some(id => menuItems.find(m => m.id === id)?.categoria === 'bebidas')) {
        return;
      }
      // If we already selected a pizza in this single turn, don't add another pizza
      if ((item.categoria === 'pizzas' || item.categoria === 'pizzetas') && Array.from(selectedItemIds).some(id => ['pizzas', 'pizzetas'].includes(menuItems.find(m => m.id === id)?.categoria || ''))) {
        return;
      }

      selectedItemIds.add(item.id);

      const isPizza = item.categoria === 'pizzas' || item.categoria === 'pizzetas';
      const gustosForThis = isPizza ? [...foundGlobalGustos] : [];
      const gustosTotal = gustosForThis.reduce((s, g) => s + (g.precio || 30), 0);
      const itemPrice = (item.precio && item.precio >= 50 ? item.precio : 1250) + gustosTotal;

      cart.push({
        id: item.id || `cart-${Date.now()}-${Math.random()}`,
        productoId: item.id || '',
        nombre: item.nombre,
        precio: itemPrice,
        precioUnitario: itemPrice,
        cantidad: qty,
        categoria: item.categoria || 'pizzas',
        gustos: gustosForThis,
        notas: gustosForThis.length > 0 ? `+ ${gustosForThis.map(g => `${g.nombre} (+$${g.precio || 30})`).join(', ')}` : '',
      });
    });
  }

  // Fallback if no item scored:
  if (cart.length === 0) {
    if (wantsFainaQueso) {
      cart.push({ id: 'f2', productoId: 'f2', nombre: 'FAINÁ CON QUESO', precio: 160, precioUnitario: 160, cantidad: 1, categoria: 'fainas' });
    } else if (wantsFainaComun) {
      cart.push({ id: 'f1', productoId: 'f1', nombre: 'FAINÁ COMÚN', precio: 130, precioUnitario: 130, cantidad: 1, categoria: 'fainas' });
    } else if (normalized.includes('refresco') || normalized.includes('coca')) {
      const is600 = wants600ML;
      cart.push({
        id: is600 ? 'b2' : 'b1',
        productoId: is600 ? 'b2' : 'b1',
        nombre: is600 ? 'REFRESCO 600 ML' : 'REFRESCO 1.5 L',
        precio: is600 ? 95 : 160,
        precioUnitario: is600 ? 95 : 160,
        cantidad: 1,
        categoria: 'bebidas'
      });
    } else if (normalized.includes('cerveza') || normalized.includes('patricia')) {
      cart.push({ id: 'b5', productoId: 'b5', nombre: 'CERVEZA PATRICIA 1L', precio: 210, precioUnitario: 210, cantidad: 1, categoria: 'bebidas' });
    } else if (normalized.includes('muzza') || normalized.includes('musa') || normalized.includes('pizza') || wantsFullMetro) {
      const gustosTotal = foundGlobalGustos.reduce((s, g) => s + (g.precio || 30), 0);
      cart.push({
        id: 'p5',
        productoId: 'p5',
        nombre: '1 METRO PIZZA MUZZARELLA',
        precio: 1250 + gustosTotal,
        precioUnitario: 1250 + gustosTotal,
        cantidad: 1,
        categoria: 'pizzas',
        gustos: foundGlobalGustos,
        notas: foundGlobalGustos.length > 0 ? `+ ${foundGlobalGustos.map(g => `${g.nombre} (+$${g.precio || 30})`).join(', ')}` : '',
      });
    }
  }

  const totalCalculado = cart.reduce((a, b) => a + (b.precioUnitario || b.precio || 0) * (b.cantidad || 1), 0);
  const totalCantidad = cart.reduce((a, b) => a + (b.cantidad || 1), 0);
  const resumen = `Comanda de ${totalCantidad} productos. Total: $${totalCalculado}`;

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
 * Gemini AI Cloud Fallback Parser
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
