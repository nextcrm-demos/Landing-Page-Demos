import React, { useState } from 'react';
import { 
  Zap, Clock, ChevronsDown, ChevronsUp, Info, Check, Edit, Trash2, MessageSquare, MapPin, Flame, AlertTriangle, Layers
} from 'lucide-react';
import { Order } from '../types';

interface KDSModuleProps {
  kitchenOrders: Order[];
  currentTime: number;
  markAsDone: (id: string) => void;
  handleEditOrder: (orderId: string, fromLocation: 'kitchen' | 'ready') => void;
  handleCancelOrder: (orderId: string, fromLocation: 'kitchen' | 'ready') => void;
}

export function KDSModule({
  kitchenOrders,
  currentTime,
  markAsDone,
  handleEditOrder,
  handleCancelOrder,
}: KDSModuleProps) {
  const DELAY_MINUTES = 30;
  const isDelayed = (ts?: number) => ts ? (currentTime - ts) >= (DELAY_MINUTES * 60 * 1000) : false;
  const getElapsedMinutes = (ts?: number) => ts ? Math.floor((currentTime - ts) / 60000) : 0;
  
  // Track open/collapsed state per order
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getMinutesUntil = (timeStr?: string) => {
    if (!timeStr) return Infinity;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2) return Infinity;
    const [hours, minutes] = parts;
    const now = new Date(currentTime);
    const target = new Date(currentTime);
    target.setHours(hours, minutes, 0, 0);
    if (target < now && (now.getTime() - target.getTime()) > 12 * 60 * 60 * 1000) {
      target.setDate(target.getDate() + 1);
    }
    return Math.floor((target.getTime() - now.getTime()) / 60000);
  };

  const renderOrderList = (filteredOrders: Order[], title: string, badgeColor: string) => (
    <div className="w-[340px] sm:w-[380px] shrink-0 flex flex-col bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-full">
      {/* COLUMN HEADER */}
      <div className="bg-white/5 border-b border-white/10 p-3.5 font-bold tracking-wider text-xs text-white flex justify-between items-center px-4 uppercase shrink-0">
        <span className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${badgeColor}`}></span>
          {title}
        </span>
        <span className="bg-white/10 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
          {filteredOrders.length}
        </span>
      </div>

      {/* SCROLLABLE ORDER CARDS - NEVER SQUISHED */}
      <div className="flex-1 overflow-y-auto space-y-3 p-3.5 custom-scrollbar min-h-0">
        {filteredOrders.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-xs border border-dashed border-white/5 rounded-2xl p-4 text-center">
            <span>Sin comandas pendientes en esta estación</span>
          </div>
        ) : (
          filteredOrders.map(order => {
            const delayed = isDelayed(order.timestamp);
            const elapsed = getElapsedMinutes(order.timestamp);
            const totalItemsCount = order.cart.reduce((sum, item) => sum + item.cantidad, 0);
            
            // Auto expand if delayed or if explicitly toggled
            const isOpen = expandedOrders[order.id] ?? delayed;

            return (
              <div 
                key={order.id} 
                className={`bg-[#0d1527] rounded-2xl border transition-all overflow-hidden shrink-0 ${
                  delayed 
                    ? 'border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)]' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* CARD ACCORDION SUMMARY (ALWAYS COMFORTABLE & READABLE) */}
                <div 
                  onClick={() => toggleOrder(order.id)}
                  className={`p-3.5 cursor-pointer flex flex-col gap-2 transition-colors select-none ${
                    delayed ? 'bg-red-950/40 hover:bg-red-950/60' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-white">#{order.id}</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold text-slate-300">
                        {totalItemsCount} ítems
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 font-mono ${
                        delayed 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : elapsed > 15 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <Clock size={12}/> {elapsed} min
                      </span>
                      {isOpen ? <ChevronsUp size={16} className="text-slate-400" /> : <ChevronsDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Customer / Location Info */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 truncate">
                      {order.pago.tipo === 'mesa' 
                        ? `MESA ${order.cliente.mesa || '?'}` 
                        : (order.cliente.nombre || 'MOSTRADOR')}
                    </span>
                    {order.cliente.direccion && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[160px] flex items-center gap-1">
                        <MapPin size={10} className="text-emerald-400 shrink-0" />
                        {order.cliente.direccion}
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDED ACCORDION CONTENT (RECIPES & ACTIONS) */}
                {isOpen && (
                  <div className="p-3.5 bg-black/40 border-t border-white/5 space-y-3">
                    {/* Products list */}
                    <ul className="space-y-2">
                      {order.cart.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <div className="font-normal text-slate-200">
                            <span className="text-emerald-400 font-extrabold mr-1.5 text-sm">{item.cantidad}x</span> 
                            <span className="font-bold">{item.nombre}</span>
                            {item.notas && (
                              <p className="text-[10px] text-amber-300 font-semibold mt-1 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                                <Info size={11} className="shrink-0 text-amber-400"/> + {item.notas}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {order.pago.notas && (
                      <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[10px] text-amber-300 font-bold uppercase">
                        NOTAS COCINA: {order.pago.notas}
                      </div>
                    )}

                    {/* Touch Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        onClick={() => markAsDone(order.id)} 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Check size={16} /> Listo
                      </button>
                      <button 
                        onClick={() => handleEditOrder(order.id, 'kitchen')} 
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-colors border border-white/10 cursor-pointer" 
                        title="Modificar Comanda"
                      >
                        <Edit size={16}/>
                      </button>
                      <button 
                        onClick={() => handleCancelOrder(order.id, 'kitchen')} 
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition-colors border border-red-500/20 cursor-pointer" 
                        title="Cancelar Pedido"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const programadosOrders = kitchenOrders.filter(o => o.pago.programado);

  return (
    <div className="flex-1 bg-[#050505] flex flex-col overflow-hidden relative h-full">
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-red-900/5 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>

      {/* TOP KDS BAR */}
      <div className="bg-[#0a0f1c]/95 backdrop-blur-md border-b border-white/10 p-3 sm:p-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
            <Zap size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-wider text-white uppercase flex items-center gap-2">
              KDS Monitor de Cocina
            </h2>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Comandas en tiempo real organizadas por estación</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-white/5 border border-white/10 text-slate-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Clock size={14} className="text-emerald-400"/> {new Date(currentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
          </span>
        </div>
      </div>

      {/* KDS COLUMNS - HORIZONTALLY SCROLLABLE, INNER VERTICAL SCROLL PER COLUMN */}
      <div className="flex-1 flex gap-4 p-4 sm:p-6 overflow-x-auto custom-scrollbar z-10 items-stretch min-h-0">
        {/* RETIRO LOCAL */}
        {renderOrderList(
          kitchenOrders.filter(o => o.pago.tipo === 'local' && !o.pago.programado), 
          'Retiro Local / Barra',
          'bg-blue-400'
        )}

        {/* SALÓN MESAS */}
        {renderOrderList(
          kitchenOrders.filter(o => o.pago.tipo === 'mesa' && !o.pago.programado), 
          'Salón & Mesas',
          'bg-purple-400'
        )}

        {/* DELIVERY */}
        {renderOrderList(
          kitchenOrders.filter(o => o.pago.tipo === 'envio' && !o.pago.programado), 
          'Delivery a Domicilio',
          'bg-emerald-400'
        )}

        {/* PEDIDOS PROGRAMADOS */}
        <div className="w-[340px] sm:w-[380px] shrink-0 flex flex-col bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-full">
          <div className="bg-white/5 border-b border-white/10 p-3.5 font-bold tracking-wider text-xs text-white flex justify-between items-center px-4 uppercase shrink-0">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Encargos Programados
            </span>
            <span className="bg-white/10 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold">
              {programadosOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-3.5 custom-scrollbar min-h-0">
            {programadosOrders.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-xs border border-dashed border-white/5 rounded-2xl p-4 text-center">
                <span>No hay pedidos programados con hora fija</span>
              </div>
            ) : (
              programadosOrders.map(order => {
                const minutesUntil = getMinutesUntil(order.pago.horaProgramada);
                const isAlert = minutesUntil <= 20 && minutesUntil > 0;
                const isLate = minutesUntil <= 0;
                const isOpen = expandedOrders[order.id] ?? (isAlert || isLate);

                return (
                  <div 
                    key={order.id} 
                    className={`bg-[#0d1527] rounded-2xl border transition-all overflow-hidden shrink-0 ${
                      isLate 
                        ? 'border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.3)]' 
                        : isAlert 
                        ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                        : 'border-white/10'
                    }`}
                  >
                    <div 
                      onClick={() => toggleOrder(order.id)}
                      className={`p-3.5 cursor-pointer flex flex-col gap-2 transition-colors select-none ${
                        isLate ? 'bg-red-950/40' : isAlert ? 'bg-amber-950/40' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-lg text-white">#{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 font-mono ${
                          isLate ? 'bg-red-600 text-white' : isAlert ? 'bg-amber-500 text-slate-950 font-black' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          <Clock size={11}/> PARA: {order.pago.horaProgramada}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-bold">{order.cliente.nombre || 'Sin nombre'}</span>
                        <span className="text-[10px] text-slate-400">{order.cart.length} productos</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="p-3.5 bg-black/40 border-t border-white/5 space-y-3">
                        <ul className="space-y-2 text-xs">
                          {order.cart.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-start text-slate-200">
                              <div>
                                <span className="text-emerald-400 font-bold mr-1.5">{item.cantidad}x</span>
                                <span>{item.nombre}</span>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <div className="flex items-center gap-2 pt-1">
                          <button 
                            onClick={() => markAsDone(order.id)} 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow cursor-pointer"
                          >
                            <Check size={16} /> Listo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
