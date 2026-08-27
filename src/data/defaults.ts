import { MenuItem, Gusto, Client, HistoricalTurn, MonthlyClosing } from '../types';


export const defaultMenuList: MenuItem[] = [
  // Sandwiches
  { id: 's1', nombre: 'SÁNDWICH CALIENTE', categoria: 'sandwiches', precio: 350, descripcion: 'Jamón cocido y queso caliente en pan tostado artesanal' },
  { id: 's2', nombre: 'SÁNDWICH CALIENTE CON MUZZARELLA', categoria: 'sandwiches', precio: 400, descripcion: 'Doble jamón cocido y abundante muzzarella fundida' },
  { id: 's3', nombre: 'SÁNDWICH NAPOLITANO', categoria: 'sandwiches', precio: 420, descripcion: 'Jamón, queso muzzarella fundida, rodajas de tomate y orégano' },
  
  // Pizzetas
  { id: 'pz1', nombre: 'PIZZETA MUZZARELLA', categoria: 'pizzetas', precio: 480, tieneGustos: true, descripcion: 'Salsa de tomate casera y abundante muzzarella artesanal' },
  { id: 'pz2', nombre: 'PIZZETA NAPOLITANA', categoria: 'pizzetas', precio: 550, tieneGustos: true, descripcion: 'Muzzarella, jamón cocido y rodajas de tomate' },
  { id: 'pz3', nombre: 'PIZZETA CALABRESA', categoria: 'pizzetas', precio: 530, tieneGustos: true, descripcion: 'Muzzarella y rodajas de peperoni / calabresa especiada' },
  { id: 'pz4', nombre: 'PIZZETA 4 QUESOS', categoria: 'pizzetas', precio: 580, tieneGustos: true, descripcion: 'Muzzarella, parmesano, dambo y roquefort' },
  { id: 'pz5', nombre: 'PIZZETA HAWAIANA', categoria: 'pizzetas', precio: 580, tieneGustos: true, descripcion: 'Muzzarella, jamón cocido y ananá en almíbar' },
  { id: 'pz6', nombre: 'PIZZETA AMERICANA', categoria: 'pizzetas', precio: 560, tieneGustos: true, descripcion: 'Muzzarella, panceta crocante y huevo duro' },
  { id: 'pz7', nombre: 'PIZZETA ROQUEFORT Y CEBOLLA', categoria: 'pizzetas', precio: 560, tieneGustos: true, descripcion: 'Muzzarella, queso azul roquefort y cebolla caramelizada' },
  { id: 'pz8', nombre: 'PIZZETA RÚCULA Y TOMATE', categoria: 'pizzetas', precio: 540, tieneGustos: true, descripcion: 'Muzzarella, hojas de rúcula fresca y tomates secos o frescos' },
  { id: 'pz9', nombre: 'PIZZETA JAMÓN Y CHAMPIÑONES', categoria: 'pizzetas', precio: 580, tieneGustos: true, descripcion: 'Muzzarella, jamón cocido y champiñones fileteados' },
  { id: 'pz10', nombre: 'PIZZETA COMÚN', categoria: 'pizzetas', precio: 380, tieneGustos: true, descripcion: 'Salsa de tomate clásica horneada a la piedra' },

  // Pizzas al Metro & Porción
  { id: 'p1', nombre: '(PORCIÓN) MUZZARELLA', categoria: 'pizzas', precio: 250, tieneGustos: true, descripcion: 'Porción clásica de pizza a la pala con muzzarella' },
  { id: 'p2', nombre: '(PORCIÓN) PIZZA COMÚN', categoria: 'pizzas', precio: 180, descripcion: 'Porción de pizza clásica con salsa suave de tomate' },
  { id: 'p3', nombre: '1/2 METRO PIZZA MUZZARELLA', categoria: 'pizzas', precio: 680, tieneGustos: true, descripcion: 'Medio metro de pizza a la pala con muzzarella fundida' },
  { id: 'p4', nombre: '1/2 METRO PIZZA COMÚN', categoria: 'pizzas', precio: 490, descripcion: 'Medio metro de pizza al corte con salsa' },
  { id: 'p5', nombre: '1 METRO PIZZA MUZZARELLA', categoria: 'pizzas', precio: 1250, tieneGustos: true, descripcion: 'Metro completo de pizza tradicional con abundante muzzarella' },
  { id: 'p6', nombre: '1 METRO PIZZA COMÚN', categoria: 'pizzas', precio: 920, descripcion: 'Metro completo de pizza clásica' },

  // Fainas
  { id: 'f1', nombre: 'FAINÁ COMÚN', categoria: 'fainas', precio: 130, descripcion: 'Fainá tradicional crocante recién salido del horno' },
  { id: 'f2', nombre: 'FAINÁ CON QUESO', categoria: 'fainas', precio: 160, descripcion: 'Fainá dorado con capa de muzzarella y queso rallado' },
  { id: 'f3', nombre: 'FAINÁ ORILLA', categoria: 'fainas', precio: 140, descripcion: 'Porción crocante de orilla' },
  { id: 'f4', nombre: 'FAINÁ CENTRO', categoria: 'fainas', precio: 130, descripcion: 'Porción suave y tierna del centro' },

  // Figazzas
  { id: 'fg1', nombre: 'FIGAZZA CON MUZZARELLA', categoria: 'figazza', precio: 390, tieneGustos: true, descripcion: 'Masa al horno con cebolla sazonada y abundante muzzarella' },
  { id: 'fg2', nombre: 'FIGAZZA COMÚN', categoria: 'figazza', precio: 290, descripcion: 'Clásica con cebollas doradas y orégano' },

  // Promociones
  { id: 'pr1', nombre: 'PROMO 1 METRO MUZZA + REFRESCO 1.5L', categoria: 'promos', precio: 1380, tieneGustos: true, descripcion: '1 Metro de muzzarella + Refresco 1.5L a elección' },
  { id: 'pr2', nombre: 'PROMO 2 PIZZETAS + POSTRE CHAJÁ', categoria: 'promos', precio: 1050, tieneGustos: true, descripcion: '2 Pizzetas muzzarella con 1 gusto + 1 Chajá individual' },
  { id: 'pr3', nombre: 'PROMO 2 FAINÁS + 2 PORCIONES MUZZA', categoria: 'promos', precio: 690, descripcion: 'Combo individual o para compartir' },

  // Bebidas
  { id: 'b1', nombre: 'REFRESCO 1.5 L', categoria: 'bebidas', precio: 160, descripcion: 'Coca-Cola, Sprite, Fanta o Pomelo' },
  { id: 'b2', nombre: 'REFRESCO 600 ML', categoria: 'bebidas', precio: 95, descripcion: 'Línea Coca-Cola 600ml' },
  { id: 'b3', nombre: 'AGUA SALUS 1.5L', categoria: 'bebidas', precio: 110, descripcion: 'Con o sin gas' },
  { id: 'b4', nombre: 'AGUA SALUS 600ML', categoria: 'bebidas', precio: 70, descripcion: 'Con o sin gas' },
  { id: 'b5', nombre: 'CERVEZA PATRICIA 1L', categoria: 'bebidas', precio: 210, descripcion: 'Cerveza rubia uruguaya 1 Litro retornable/descartable' },
  { id: 'b6', nombre: 'CERVEZA STELLA ARTOIS 1L', categoria: 'bebidas', precio: 240, descripcion: 'Premium lager 1 Litro' },
  { id: 'b7', nombre: 'CERVEZA ZILLERTAL 1L', categoria: 'bebidas', precio: 230, descripcion: 'Cerveza premium uruguaya' },
  { id: 'b8', nombre: 'CERVEZA PILSEN 1L', categoria: 'bebidas', precio: 190, descripcion: 'Cerveza clásica uruguaya' },
  { id: 'b9', nombre: 'CERVEZA CORONA 330ML', categoria: 'bebidas', precio: 150, descripcion: 'Botella individual de 330cc' },
  { id: 'b10', nombre: 'SALUS FRUTTE 600ML', categoria: 'bebidas', precio: 85, descripcion: 'Manzana, Citrus, Naranja o Pera' },

  // Postres
  { id: 'po1', nombre: 'POSTRE CHAJÁ', categoria: 'postres', precio: 190, descripcion: 'Chajá clásico de Paysandú con durazno y merengue' },
  { id: 'po2', nombre: 'HELADO ARTESANAL', categoria: 'postres', precio: 180, descripcion: 'Dulce de leche granizado o crema americana' }
];

export const gustosAdicionales: Gusto[] = [
  { id: 'g1', nombre: 'Jamón Cocido', precio: 30 },
  { id: 'g2', nombre: 'Panceta Ahumada', precio: 30 },
  { id: 'g3', nombre: 'Cebolla Salteada', precio: 30 },
  { id: 'g4', nombre: 'Champiñones', precio: 30 },
  { id: 'g5', nombre: 'Roquefort / Queso Azul', precio: 30 },
  { id: 'g6', nombre: 'Aceitunas Verdes / Negras', precio: 30 },
  { id: 'g7', nombre: 'Morrones Asados', precio: 30 },
  { id: 'g8', nombre: 'Huevo Duro', precio: 30 },
  { id: 'g9', nombre: 'Extra Muzzarella', precio: 30 },
  { id: 'g10', nombre: 'Palmitos', precio: 30 },
  { id: 'g11', nombre: 'Tomate en Rodajas', precio: 30 },
  { id: 'g12', nombre: 'Provolone', precio: 30 },
  { id: 'g13', nombre: 'Cheddar', precio: 30 },
  { id: 'g14', nombre: 'Salamín / Longaniza', precio: 30 },
  { id: 'g15', nombre: 'Ananá', precio: 30 },
  { id: 'g16', nombre: 'Albahaca Fresca', precio: 30 },
  { id: 'g17', nombre: 'Choclo Dulce', precio: 30 },
  { id: 'g18', nombre: 'Cuatro Quesos', precio: 30 }
];

export const defaultClients: Client[] = [
  { id: 'c1', nombre: 'ABEL MARTINEZ', telefono: '098128297', direccion: 'PLAYA HERMOSA' },
  { id: 'c2', nombre: 'JOSELIN', telefono: '092494927', direccion: 'CENTRO' },
  { id: 'c3', nombre: 'ADRIAN GIL', telefono: '098762242', direccion: 'BARRIO SUR' }
];

export const defaultHistorical: HistoricalTurn[] = [
  { id: 'h1', fecha: '27/7/2026 00:08', v: 15705, c: 10865, cajero: 'Admin' },
  { id: 'h2', fecha: '26/7/2026 01:52', v: 25930, c: 15645, cajero: 'Admin' }
];

export const defaultMonthlyClosings: MonthlyClosing[] = [
  {
    id: '2026-07',
    mesNombre: 'Julio 2026',
    mesNumero: 7,
    anio: 2026,
    fechaCierre: '31/07/2026 23:59',
    timestamp: 1785542340000,
    totalVentas: 485920,
    totalComandas: 842,
    ticketPromedio: 577,
    efectivoTotal: 218660,
    debitoTotal: 155490,
    creditoTotal: 87340,
    transferenciaTotal: 24430,
    propinasTotal: 19850,
    pedidosDelivery: 512,
    pedidosLocal: 218,
    pedidosMesa: 112,
    turnosRealizados: 62,
    cerradoPor: 'Admin / Encargado General',
    observaciones: 'Cierre de mes de Julio completado con arqueo cuadrado y conciliación bancaria.',
    productosMasVendidos: [
      { nombre: '1 Metro Pizza Muzzarella', cantidad: 384, total: 153600 },
      { nombre: 'Fainá Orilla', cantidad: 620, total: 46500 },
      { nombre: 'Pizzeta Muzzarella', cantidad: 295, total: 53100 },
      { nombre: 'Refresco 1.5 L', cantidad: 410, total: 61500 },
      { nombre: 'Promo + Chajá', cantidad: 180, total: 54000 },
    ],
    consumoFisico: {
      'Metros de Pizza': 480,
      'Postres (Unidades)': 195,
      'Bebidas (Unidades)': 530,
      'Pizzetas': 295,
      'Fainá (Porciones)': 620,
    }
  },
  {
    id: '2026-06',
    mesNombre: 'Junio 2026',
    mesNumero: 6,
    anio: 2026,
    fechaCierre: '30/06/2026 23:59',
    timestamp: 1782863940000,
    totalVentas: 432180,
    totalComandas: 760,
    ticketPromedio: 568,
    efectivoTotal: 194480,
    debitoTotal: 138290,
    creditoTotal: 77790,
    transferenciaTotal: 21620,
    propinasTotal: 17400,
    pedidosDelivery: 460,
    pedidosLocal: 198,
    pedidosMesa: 102,
    turnosRealizados: 60,
    cerradoPor: 'Admin',
    observaciones: 'Cierre mensual regular de Junio.',
    productosMasVendidos: [
      { nombre: '1 Metro Pizza Muzzarella', cantidad: 340, total: 136000 },
      { nombre: 'Fainá Orilla', cantidad: 550, total: 41250 },
      { nombre: 'Refresco 1.5 L', cantidad: 380, total: 57000 },
    ],
    consumoFisico: {
      'Metros de Pizza': 420,
      'Postres (Unidades)': 170,
      'Bebidas (Unidades)': 480,
      'Pizzetas': 260,
      'Fainá (Porciones)': 550,
    }
  }
];

