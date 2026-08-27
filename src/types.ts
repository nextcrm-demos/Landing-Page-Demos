export interface MenuItem {
  id: string | number;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion?: string;
  tieneGustos?: boolean;
}

export interface DemoAccount {
  id: string;
  clienteNombre: string;
  negocioNombre?: string;
  emailOrUser: string;
  password?: string;
  duracionHoras: number; // e.g. 24, 48, 168 (7 days), 0 for unlimited
  creadoTimestamp: number;
  activadoTimestamp?: number;
  expiraTimestamp?: number;
  estado: 'activo' | 'bloqueado' | 'expirado' | 'ilimitado';
  ultimoIngresoTimestamp?: number;
  totalIngresos?: number;
  creadoPor: string;
  notas?: string;
  plan?: 'plan_basico' | 'plan_pro' | 'plan_vip';
  solicitudesRealizadas?: number;
  solicitudesMaximas?: number; // 1 (Basico), 2 (Pro), 999 (VIP)
}

export interface Gusto {
  id: string;
  nombre: string;
  precio: number;
}

export interface Client {
  id: string | number;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface HistoricalTurn {
  id: string | number;
  fecha: string;
  v: number;
  c: number;
  cajero: string;
}

export interface CartItem extends MenuItem {
  cantidad: number;
  precioUnitario: number;
  notas?: string;
  gustos?: Gusto[];
}

export interface OrderClient {
  nombre: string;
  mesa: string;
  telefono: string;
  direccion: string;
}

export interface OrderPayment {
  tipo: 'local' | 'mesa' | 'envio' | string;
  metodo: string;
  notas: string;
  programado: boolean;
  horaProgramada: string;
  abono: string;
  propina: string;
  cadete: string;
  tarjetaSello?: string;
  tarjetaTipo?: 'debito' | 'credito' | string;
  propinaMetodo?: 'efectivo' | 'tarjeta' | string;
}

export interface Order {
  id: string;
  cart: CartItem[];
  cliente: OrderClient;
  pago: OrderPayment;
  total: number;
  estado: 'preparando' | 'listo' | 'entregado' | string;
  fecha: string;
  horaPedido?: string;
  horaListo?: string;
  horaEntregado?: string;
  timestamp: number;
}

export interface ModalConfig {
  type: 'confirm' | 'input_form' | 'alert';
  title: string;
  message?: string;
  defaultValues?: Record<string, any>;
  fields?: Array<{ name: string; label: string }>;
  onConfirm: (data?: any) => void;
}

export interface CFEInvoice {
  id: string;
  numeroCFE: string;
  tipoCFE: '101' | '111' | '102' | '112'; // 101: e-Ticket, 111: e-Factura, 102: Nota Crédito e-Ticket, 112: Nota Crédito e-Factura
  tipoNombre: string; // e.g. "e-Ticket", "e-Factura"
  serie: string; // e.g. "A", "B"
  numero: number; // e.g. 1042
  fechaEmision: string;
  timestamp: number;
  proveedor: 'Facturando' | 'DGI' | 'Sicfe' | 'Uruware' | 'Memory';
  emisorRUT: string;
  emisorRazonSocial: string;
  receptorRUT?: string;
  receptorCI?: string;
  receptorNombre: string;
  receptorDireccion?: string;
  montoNeto: number;
  montoIVA: number;
  tasaIVA: number; // 22 or 10 or 0
  montoTotal: number;
  moneda: 'UYU' | 'USD';
  formaPago: 'contado' | 'credito';
  estadoDGI: 'ACEPTADO' | 'PENDIENTE' | 'RECHAZADO';
  codigoCAE: string;
  vencimientoCAE: string;
  qrURL?: string;
  orderId?: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    tasaIVA: number;
  }>;
}

export interface MonthlyClosing {
  id: string; // e.g. "2026-08" or timestamp
  mesNombre: string; // e.g. "Agosto 2026"
  mesNumero: number; // 8
  anio: number; // 2026
  fechaCierre: string; // "31/08/2026 23:59"
  timestamp: number;
  totalVentas: number;
  totalComandas: number;
  ticketPromedio: number;
  efectivoTotal: number;
  debitoTotal: number;
  creditoTotal: number;
  transferenciaTotal: number;
  propinasTotal: number;
  pedidosDelivery: number;
  pedidosLocal: number;
  pedidosMesa: number;
  turnosRealizados: number;
  productosMasVendidos: Array<{ nombre: string; cantidad: number; total: number }>;
  consumoFisico: Record<string, number>;
  desglosePorDia?: Array<{ fecha: string; dia: number; ventas: number; comandas: number }>;
  cerradoPor: string;
  observaciones?: string;
}

export interface FacturandoConfig {
  proveedor: 'Facturando' | 'DGI' | 'Sicfe' | 'Uruware' | 'Memory';
  rut: string;
  razonSocial: string;
  nombreFantasia: string;
  ambiente: 'produccion' | 'testing';
  apiToken: string;
  serieETicket: string;
  proximoETicket: number;
  serieEFactura: string;
  proximoEFactura: number;
  autoEmitirAlCobrar: boolean;
  sucursalDGI: string;
  puntoVentaDGI: string;
  activo: boolean;
}

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  senderName: string;
  senderPhone: string;
  text: string;
  timestamp: number;
  fromMe: boolean;
  status: 'recibido' | 'leido' | 'convertido_comanda' | 'respondido';
  parsedOrder?: any;
}

export interface WhatsAppChat {
  id: string;
  contactName: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
  clientMatched?: Client;
  messages: WhatsAppMessage[];
}

export type TabType = 
  | 'Toma de Pedidos'
  | 'Mostrador'
  | 'Mesas'
  | 'Delivery'
  | 'Finalizados'
  | 'Cocina'
  | 'WhatsApp'
  | 'Módulo Web'
  | 'Clientes'
  | 'Menú'
  | 'Stock'
  | 'Facturación'
  | 'Reportes'
  | 'Historial'
  | 'Caja'
  | 'Soporte';
