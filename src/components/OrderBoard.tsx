import React from 'react';
import { 
  CheckCircle, Clock, MapPin, MessageSquare, Info, Edit, Trash2, Heart, Printer, History, Check 
} from 'lucide-react';
import { Order } from '../types';

interface OrderBoardProps {
  title: string;
  icon: React.ReactNode;
  orders: Order[];
  currentTime: number;
  markAsDelivered: (id: string) => void;
  handleEditOrder: (orderId: string, fromLocation: 'ready') => void;
  handleCancelOrder: (orderId: string, fromLocation: 'ready') => void;
}

export function OrderBoard({
  title,
  icon,
  orders,
  currentTime,
  markAsDelivered,
  handleEditOrder,
  handleCancelOrder,
}: OrderBoardProps) {
  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col h-full relative z-10">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-6 shrink-0 shadow-xl">
          <h2 className="text-base font-light text-white tracking-[0.15em] flex items-center gap-3 uppercase">{icon} {title}</h2>
          <div className="bg-white/5 text-slate-300 px-4 py-1.5 rounded-full font-light tracking-widest text-xs border border-white/10">{orders.length} PENDIENTES</div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start custom-scrollbar">
          {orders.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600">
              <CheckCircle size={48} className="opacity-50"/>
              <p className="mt-4 font-light tracking-[0.2em] uppercase text-sm">Todo Entregado</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-[#0a0f1c]/90 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 flex flex-col shadow-2xl hover:border-white/20 transition-all min-h-[420px]">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-5 border-b border-white/10 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-light text-slate-400 uppercase tracking-widest">ORDEN #{order.id}</p>
                      <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">{order.pago.tipo}</span>
                    </div>
                    <h3 className="font-light text-xl text-white leading-tight mb-2 truncate max-w-[150px]">{order.cliente.nombre || 'MOSTRADOR'}</h3>
                    {order.cliente.telefono && <p className="text-xs font-light text-slate-400 mb-1"><MessageSquare size={12} className="inline mr-1 text-slate-500"/>{order.cliente.telefono}</p>}
                    {order.cliente.direccion && (
                      <p className={`text-xs font-light truncate max-w-[150px] ${order.cliente.direccion.toLowerCase().includes('confirmar') ? 'text-red-400 animate-pulse font-medium' : 'text-slate-400'}`}>
                        <MapPin size={12} className={`inline mr-1 ${order.cliente.direccion.toLowerCase().includes('confirmar') ? 'text-red-500' : 'text-slate-500'}`}/>{order.cliente.direccion}
                      </p>
                    )}
                    {order.cliente.mesa && <p className="text-xs font-medium text-white bg-white/10 inline-block px-2.5 py-1 rounded-md mt-2 border border-white/10">MESA: {order.cliente.mesa}</p>}
                    
                    {/* Tiempos */}
                    <div className="flex flex-col gap-1.5 mt-4">
                      <span className="text-[9px] font-light tracking-wide text-slate-400"><Clock size={10} className="inline mr-1"/>PEDIDO: {order.horaPedido || order.fecha}</span>
                      {order.horaListo && <span className="text-[9px] font-light tracking-wide text-blue-300"><CheckCircle size={10} className="inline mr-1"/>LISTO: {order.horaListo}</span>}
                      <span className="text-[9px] font-light tracking-wide text-emerald-400"><Clock size={10} className="inline mr-1"/>ACTUAL: {new Date(currentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-3xl font-light text-white">${order.total}</p>
                    <p className={`text-[9px] font-medium px-2 py-1 rounded mt-3 uppercase tracking-widest border ${order.pago.metodo === 'a confirmar' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                      {order.pago.metodo === 'a confirmar' ? 'A Confirmar' : order.pago.metodo}
                    </p>
                  </div>
                </div>
                
                {/* Detalle Carrito */}
                <div className="mb-5 bg-black/40 p-4 rounded-xl border border-white/5 flex-1 overflow-y-auto custom-scrollbar">
                  <p className="text-[9px] font-light text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Desglose del Pedido</p>
                  <ul className="space-y-3 text-xs font-light text-slate-300">
                    {order.cart.map((item, idx) => (
                      <li key={idx} className="flex flex-col">
                        <div className="flex justify-between items-start leading-snug">
                          <div><span className="text-blue-400 font-medium mr-2 text-sm">{item.cantidad}x</span> <span>{item.nombre}</span></div>
                        </div>
                        {item.notas && <span className="text-[9px] font-medium tracking-wide text-orange-400 mt-1.5 flex items-start gap-1 bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20"><Info size={10} className="shrink-0 mt-0.5"/> {item.notas}</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Datos Extras */}
                <div className="mb-5 space-y-2">
                  {order.pago.abono && order.pago.metodo === 'efectivo' && (
                    <div className="flex justify-between text-[10px] font-light tracking-wide text-slate-400 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <span>Abona con: ${order.pago.abono}</span>
                      <span className="text-emerald-400 font-medium">Vuelto: ${Math.max(0, Number(order.pago.abono) - order.total)}</span>
                    </div>
                  )}
                  {order.pago.propina && (
                    <div className="flex justify-between text-[10px] font-light tracking-wide text-blue-300 bg-blue-900/20 p-2.5 rounded-lg border border-blue-500/20">
                      <span className="flex items-center gap-1"><Heart size={10}/> PROPINA:</span>
                      <span>${order.pago.propina}</span>
                    </div>
                  )}
                  {order.pago.notas && <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-[10px] text-yellow-300 font-light tracking-wide uppercase">NOTAS: {order.pago.notas}</div>}
                </div>
                
                {/* Acciones */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-white/10">
                  <button onClick={() => markAsDelivered(order.id)} className="flex-[2] bg-emerald-600 text-white font-medium py-3.5 rounded-xl hover:bg-emerald-500 transition-colors shadow-[0_0_15px_-3px_rgba(5,150,105,0.4)] text-[11px] tracking-widest uppercase cursor-pointer">
                    {order.pago.tipo === 'mesa' ? 'Cobrar' : 'Entregar'}
                  </button>
                  <button onClick={() => handleEditOrder(order.id, 'ready')} className="bg-white/5 text-slate-300 font-light py-3 px-4 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center cursor-pointer" title="Editar / Volver a Pos"><Edit size={16}/></button>
                  <button onClick={() => handleCancelOrder(order.id, 'ready')} className="bg-red-500/10 text-red-400 font-light py-3 px-4 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20 flex items-center justify-center cursor-pointer" title="Cancelar / Eliminar"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface FinalizadosViewProps {
  dailyOrders: Order[];
  printTicketFn: (order: Order) => void;
}

export function FinalizadosView({ dailyOrders, printTicketFn }: FinalizadosViewProps) {
  const deliveredOrders = dailyOrders.filter(o => o.estado === 'entregado');

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto flex flex-col h-full relative z-10">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-6 shrink-0 shadow-xl">
          <h2 className="text-base font-light text-white tracking-[0.15em] flex items-center gap-3 uppercase"><CheckCircle size={20}/> Órdenes Finalizadas</h2>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start custom-scrollbar">
          {deliveredOrders.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-600">
              <History size={48} className="opacity-50"/>
              <p className="mt-4 font-light tracking-[0.2em] uppercase text-sm">Aún no hay entregas</p>
            </div>
          ) : (
            deliveredOrders.map(order => (
              <div key={order.id} className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-6 border border-white/5 opacity-80 hover:opacity-100 transition-opacity flex flex-col min-h-[300px]">
                <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-light text-slate-500 uppercase tracking-widest">#{order.id}</p>
                      <span className="bg-white/10 text-slate-400 font-medium px-2 py-0.5 rounded text-[9px] uppercase">{order.pago.tipo}</span>
                    </div>
                    <h3 className="font-light text-lg text-white leading-tight">{order.cliente.nombre || 'MOSTRADOR'}</h3>
                    <div className="flex flex-col gap-1.5 mt-3">
                      <span className="text-[9px] font-light tracking-wide text-slate-500"><Clock size={10} className="inline mr-1"/>Pedido: {order.horaPedido || order.fecha}</span>
                      {order.horaEntregado && <span className="text-[9px] font-light tracking-wide text-emerald-500"><Check size={10} className="inline mr-1"/>Entregado: {order.horaEntregado}</span>}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full mb-2 border border-emerald-500/20"><Check size={14}/></span>
                    <p className="font-light text-2xl text-white">${order.total}</p>
                  </div>
                </div>
                
                <div className="flex-1 text-xs font-light text-slate-400 space-y-2 mb-5 overflow-y-auto custom-scrollbar">
                  {order.cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 pb-1.5">
                      <span><span className="text-slate-300 mr-1">{item.cantidad}x</span> {item.nombre}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-3 pt-3 border-t border-white/5">
                  <p className={`text-[9px] font-medium text-center px-2 py-1.5 rounded uppercase tracking-widest border ${order.pago.metodo === 'a confirmar' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-white/5 text-slate-300 border-white/10'}`}>
                    PAGO: {order.pago.metodo}
                  </p>
                  <button onClick={() => printTicketFn(order)} className="w-full bg-white/5 text-slate-300 font-medium py-3 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest cursor-pointer"><Printer size={14}/> Reimprimir Ticket</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
