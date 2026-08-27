import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, Truck, Store, Utensils, AlertCircle, 
  RefreshCw, MessageSquare, Printer, Sparkles, ChefHat, Package, Calendar, Filter, MapPin, User, Search
} from 'lucide-react';
import { Order } from '../../types';

interface ClientTrackingModuleProps {
  orders: Order[];
  currentTime: number;
  onGoToMenu: () => void;
  printTicketFn?: (order: Order | null) => void;
}

export function ClientTrackingModule({
  orders,
  currentTime,
  onGoToMenu,
  printTicketFn,
}: ClientTrackingModuleProps) {
  const [filterSearch, setFilterSearch] = useState('');

  // Helper to determine step status index
  const getStatusStepIndex = (estado?: string) => {
    switch (estado) {
      case 'recibido': case 'pendiente': default: return 1;
      case 'en_proceso': case 'cocina': case 'preparando': return 2;
      case 'listo': case 'camino': return 3;
      case 'entregado': case 'finalizado': return 4;
    }
  };

  const sortedOrders = [...orders].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  const filteredOrders = sortedOrders.filter(o => {
    if (!filterSearch.trim()) return true;
    const term = filterSearch.toLowerCase().trim();
    return o.id.includes(term) || 
           o.cliente?.nombre?.toLowerCase().includes(term) ||
           o.cliente?.telefono?.includes(term);
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#050505] text-slate-100 font-sans custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER HERO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-[#0a0f1c] to-black p-6 rounded-3xl border border-blue-500/30 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Sincronización en Tiempo Real con Cocina KDS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              🛵 Seguimiento de Pedidos en Vivo
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Consulta en tiempo real cuando tu pizza entra al horno, se empaqueta y sale en camino.
            </p>
          </div>

          <button 
            onClick={onGoToMenu}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg text-xs tracking-wider uppercase cursor-pointer shrink-0"
          >
            + Hacer Nuevo Pedido
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <Search size={16} className="text-blue-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por Nº de Pedido, Nombre o Teléfono..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none font-mono"
          />
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-[#0a0f1c] border border-dashed border-white/10 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto">
                <Truck size={24} />
              </div>
              <h3 className="font-bold text-white text-base">No hay pedidos registrados en este momento</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Realiza tu pedido desde la pestaña de Menú para seguir el proceso en tiempo real.
              </p>
              <button
                onClick={onGoToMenu}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Ir a la Carta Digital
              </button>
            </div>
          ) : (
            filteredOrders.map(order => {
              const stepIndex = getStatusStepIndex(order.estado);
              const totalItemsCount = order.cart.reduce((sum, it) => sum + it.cantidad, 0);

              const steps = [
                { id: 1, title: 'Recibido', desc: 'Comanda ingresada al sistema', icon: Package },
                { id: 2, title: 'En Cocina', desc: 'Elaborándose en el horno a leña', icon: ChefHat },
                { id: 3, title: order.pago.tipo === 'envio' ? 'En Camino' : 'Listo para Retirar', desc: order.pago.tipo === 'envio' ? 'Cadete en viaje a tu domicilio' : 'Embalado y listo en mostrador', icon: Truck },
                { id: 4, title: 'Entregado', desc: '¡Que disfrutes tu pizza!', icon: CheckCircle2 },
              ];

              return (
                <div 
                  key={order.id} 
                  className="bg-[#0a0f1c] border border-white/10 hover:border-blue-500/40 rounded-3xl p-5 md:p-6 shadow-xl transition-all space-y-5"
                >
                  {/* ORDER CARD HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-black text-sm">
                        #{order.id.slice(-4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">Pedido #{order.id}</h4>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                            {order.pago.tipo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {order.horaPedido || 'Hora no reg.'} • {order.cliente?.nombre || 'Cliente'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-mono">Total a Pagar</span>
                      <span className="font-black text-lg text-emerald-400 font-mono">${order.total}</span>
                    </div>
                  </div>

                  {/* 4-STEP LIVE PROGRESS TRACKER BAR */}
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {steps.map((st) => {
                        const Icon = st.icon;
                        const isDone = stepIndex >= st.id;
                        const isCurrent = stepIndex === st.id;

                        return (
                          <div 
                            key={st.id} 
                            className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                              isCurrent
                                ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                : isDone
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                                : 'bg-black/40 border-white/5 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                                isCurrent ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'
                              }`}>
                                {isDone && !isCurrent ? '✓' : st.id}
                              </span>
                              <Icon size={16} className={isCurrent ? 'text-blue-400 animate-pulse' : isDone ? 'text-emerald-400' : 'text-slate-600'} />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-white">{st.title}</p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{st.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ORDER ITEMS LIST */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                      Detalle de Productos ({totalItemsCount} ítems):
                    </span>
                    <div className="divide-y divide-white/5">
                      {order.cart.map((item, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-blue-400 font-mono mr-1.5">{item.cantidad}x</span>
                            <span className="text-white font-medium">{item.nombre}</span>
                            {item.notas && <p className="text-[10px] text-amber-300 font-mono">+ {item.notas}</p>}
                          </div>
                          <span className="font-mono font-bold text-slate-300">${item.precioUnitario * item.cantidad}</span>
                        </div>
                      ))}
                    </div>

                    {order.cliente?.direccion && (
                      <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-xs text-slate-300">
                        <MapPin size={13} className="text-blue-400 shrink-0" />
                        <span>Entrega en: <strong className="text-white">{order.cliente.direccion}</strong></span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
