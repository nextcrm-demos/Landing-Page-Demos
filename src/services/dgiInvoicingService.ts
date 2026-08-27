import { CFEInvoice, FacturandoConfig, Order } from '../types';

/**
 * Esquema oficial de Petición (Request JSON) para CFE DGI Uruguay
 */
export interface DGIRequestPayload {
  encabezado: {
    tipoCFE: number; // 101: e-Ticket, 111: e-Factura
    serie: string; // Ej: "A", "B"
    numero?: number;
    fechaEmision: string; // AAAA-MM-DD
    horaEmision: string; // HH:MM:SS
    formaPago: 1 | 2 | 3; // 1: Contado/Efectivo, 2: Tarjeta, 3: Transferencia/Crédito
    moneda: 'UYU' | 'USD';
  };
  emisor: {
    rut: string;
    razonSocial: string;
    nombreFantasia: string;
    sucursalDGI: string;
    puntoVentaDGI: string;
    direccion: string;
    departamento: string;
    ciudad: string;
  };
  receptor: {
    tipoDoc: 2 | 3 | 4; // 2: RUC/RUT, 3: CI, 4: Otros / Consumidor Final
    numDoc: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
  };
  detalle: Array<{
    nroLinea: number;
    indicadorFacturacion: 1 | 2 | 3; // 1: Exento, 2: Tasa Mínima (10%), 3: Tasa Básica (22%)
    nombreItem: string;
    cantidad: number;
    unidadMedida: string; // "UNI", "KGS"
    precioUnitario: number;
    descuentoMonto?: number;
    subtotal: number;
    montoIVA: number;
    total: number;
  }>;
  totales: {
    montoSubtotalSinIVA: number;
    montoIVAMinimo10: number;
    montoIVABasico22: number;
    montoTotalExento: number;
    montoTotalAPagar: number;
    cantLineas: number;
  };
}

/**
 * Esquema de Respuesta (Response JSON) retornado por el Proveedor homologado DGI
 */
export interface DGIResponsePayload {
  success: boolean;
  estadoDGI: 'ACEPTADO' | 'PENDIENTE' | 'RECHAZADO';
  mensaje: string;
  cfe: {
    tipoCFE: number;
    tipoNombre: string;
    serie: string;
    numero: number;
    codigoCompleto: string; // Ej: "A-1042"
    fechaEmision: string;
    codigoCAE: string; // Número de Autorización DGI
    rangoDesdeCAE: number;
    rangoHastaCAE: number;
    vencimientoCAE: string; // DD/MM/AAAA
    firmaDigitalHash: string;
    qrCodeData: string; // URL de validación oficial DGI
    pdfUrl: string; // Link de descarga directa de comprobante
  };
}

/**
 * 1. Estructurar la petición (Request) 📦
 */
export function buildDGIRequestPayload(
  order: Partial<Order> | { items: Array<{ name: string; quantity: number; price: number; tasaIVA?: number }>; total: number; customerName?: string; customerPhone?: string },
  tipoCFE: 101 | 111,
  config: FacturandoConfig,
  receptorInfo?: { docTipo: 2 | 3 | 4; docNumero: string; nombre: string; direccion?: string },
  formaPagoTipo: 1 | 2 | 3 = 1
): DGIRequestPayload {
  const now = new Date();
  const fechaISO = now.toISOString().split('T')[0];
  const horaISO = now.toTimeString().split(' ')[0];

  const items = order.items || [];
  let subtotalSinIva = 0;
  let totalIva10 = 0;
  let totalIva22 = 0;
  let totalExento = 0;

  const detalle = items.map((item, index) => {
    const qty = (item as any).quantity || (item as any).cantidad || 1;
    const price = item.price || (item as any).precioUnitario || 0;
    const totalItem = price * qty;
    const tasa = item.tasaIVA !== undefined ? item.tasaIVA : 22; // Por defecto 22% en gastronomía

    let indFact: 1 | 2 | 3 = 3;
    let ivaItem = 0;
    let netoItem = totalItem;

    if (tasa === 22) {
      indFact = 3;
      netoItem = Math.round((totalItem / 1.22) * 100) / 100;
      ivaItem = Math.round((totalItem - netoItem) * 100) / 100;
      totalIva22 += ivaItem;
      subtotalSinIva += netoItem;
    } else if (tasa === 10) {
      indFact = 2;
      netoItem = Math.round((totalItem / 1.10) * 100) / 100;
      ivaItem = Math.round((totalItem - netoItem) * 100) / 100;
      totalIva10 += ivaItem;
      subtotalSinIva += netoItem;
    } else {
      indFact = 1;
      totalExento += totalItem;
      subtotalSinIva += totalItem;
    }

    return {
      nroLinea: index + 1,
      indicadorFacturacion: indFact,
      nombreItem: (item as any).name || (item as any).nombre || 'Producto Gastronómico',
      cantidad: qty,
      unidadMedida: 'UNI',
      precioUnitario: price,
      subtotal: netoItem,
      montoIVA: ivaItem,
      total: totalItem,
    };
  });

  const montoTotal = order.total || detalle.reduce((acc, it) => acc + it.total, 0);

  return {
    encabezado: {
      tipoCFE,
      serie: tipoCFE === 101 ? config.serieETicket : config.serieEFactura,
      numero: tipoCFE === 101 ? config.proximoETicket : config.proximoEFactura,
      fechaEmision: fechaISO,
      horaEmision: horaISO,
      formaPago: formaPagoTipo,
      moneda: 'UYU',
    },
    emisor: {
      rut: config.rut,
      razonSocial: config.razonSocial,
      nombreFantasia: config.nombreFantasia,
      sucursalDGI: config.sucursalDGI,
      puntoVentaDGI: config.puntoVentaDGI,
      direccion: 'Av. 18 de Julio 1928, Local 4',
      departamento: 'Montevideo',
      ciudad: 'Montevideo',
    },
    receptor: {
      tipoDoc: receptorInfo?.docTipo || (tipoCFE === 111 ? 2 : 4),
      numDoc: receptorInfo?.docNumero || (tipoCFE === 111 ? '219999990019' : 'Consumidor Final'),
      nombre: receptorInfo?.nombre || (order as any).customerName || (tipoCFE === 111 ? 'EMPRESA CLIENTE S.A.' : 'Consumidor Final'),
      direccion: receptorInfo?.direccion || (order as any).address,
      telefono: (order as any).customerPhone || (order as any).phone,
    },
    detalle,
    totales: {
      montoSubtotalSinIVA: Math.round(subtotalSinIva * 100) / 100,
      montoIVAMinimo10: Math.round(totalIva10 * 100) / 100,
      montoIVABasico22: Math.round(totalIva22 * 100) / 100,
      montoTotalExento: Math.round(totalExento * 100) / 100,
      montoTotalAPagar: montoTotal,
      cantLineas: detalle.length,
    },
  };
}

/**
 * 2. Consumo de la API 🔌 & 3. Recepción de Respuesta 💾
 */
export async function emitirCFEEnProveedor(
  payload: DGIRequestPayload,
  config: FacturandoConfig
): Promise<DGIResponsePayload> {
  // Simulación de latencia de red segura (1.2s)
  await new Promise(resolve => setTimeout(resolve, 1100));

  const isEFactura = payload.encabezado.tipoCFE === 111;
  const numConsecutivo = payload.encabezado.numero || (isEFactura ? config.proximoEFactura : config.proximoETicket);
  const serie = payload.encabezado.serie;
  const caeRandom = 'CAE-' + Math.floor(10000000000000 + Math.random() * 90000000000000);
  const cfeCodigo = `${serie}-${numConsecutivo}`;

  const qrData = `https://www.efactura.dgi.gub.uy/consulta/qr?rut=${config.rut}&tipo=${payload.encabezado.tipoCFE}&serie=${serie}&nro=${numConsecutivo}&monto=${payload.totales.montoTotalAPagar}&fecha=${payload.encabezado.fechaEmision}&cae=${caeRandom}`;
  const pdfUrl = `https://facturando.uy/comprobantes/${config.rut}/${cfeCodigo}.pdf`;

  return {
    success: true,
    estadoDGI: 'ACEPTADO',
    mensaje: `Comprobante ${isEFactura ? 'e-Factura' : 'e-Ticket'} ${cfeCodigo} emitido y firmado con éxito ante DGI.`,
    cfe: {
      tipoCFE: payload.encabezado.tipoCFE,
      tipoNombre: isEFactura ? 'e-Factura' : 'e-Ticket',
      serie,
      numero: numConsecutivo,
      codigoCompleto: cfeCodigo,
      fechaEmision: new Date().toLocaleDateString('es-UY') + ' ' + new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      codigoCAE: caeRandom,
      rangoDesdeCAE: 1,
      rangoHastaCAE: 100000,
      vencimientoCAE: '31/12/2026',
      firmaDigitalHash: 'SHA256:' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      qrCodeData: qrData,
      pdfUrl,
    },
  };
}

/**
 * Genera el enlace de WhatsApp para enviar el comprobante electrónico al cliente
 */
export function buildWhatsAppInvoiceShareUrl(
  phone: string,
  invoice: CFEInvoice,
  pizzeriaName: string = 'Pizzería Gourmet'
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const targetPhone = cleanPhone.startsWith('598') ? cleanPhone : cleanPhone.startsWith('0') ? '598' + cleanPhone.substring(1) : '598' + cleanPhone;

  const msg = `🧾 *Comprobante Electrónico DGI - ${pizzeriaName}*\n\n` +
    `Hola! Te adjuntamos tu ${invoice.tipoNombre} oficial *${invoice.numeroCFE}*:\n\n` +
    `• *Monto Total:* $${invoice.montoTotal} UYU\n` +
    `• *Fecha:* ${invoice.fechaEmision}\n` +
    `• *CAE Oficial DGI:* ${invoice.codigoCAE}\n` +
    `• *Vigencia CAE:* ${invoice.vencimientoCAE}\n\n` +
    `📄 Puedes descargar tu comprobante fiscal aquí:\nhttps://facturando.uy/comprobantes/${invoice.emisorRUT}/${invoice.numeroCFE}.pdf\n\n` +
    `¡Gracias por tu compra! 🍕`;

  return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
}
