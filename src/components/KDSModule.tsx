import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, Clock, ChevronsDown, ChevronsUp, Info, Check, Edit, Trash2, 
  MapPin, AlertTriangle, Search, Eye, EyeOff, User, Phone, SlidersHorizontal, ArrowUpDown
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
  
  // View mode: 'channels' (Retiro Local, Salón Mesas, Delivery, Programados) vs 'status' (En Preparación, Nuevos, Demorados, Listos)
  const [viewMode, setViewMode] = useState<'channels' | 'status'>('channels');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Global accordion expand all / collapse all
  const [expandAll, setExpandAll] = useState(false);
  // Track open/collapsed state per order (default collapsed)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Clock string
  const [clockStr, setClockStr] = useState('');
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClockStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: prev[orderId] !== undefined ? !prev[orderId] : !expandAll
    }));
  };

  const handleToggleExpandAll = () => {
    const nextVal = !expandAll;
    setExpandAll(nextVal);
    const updated: Record<string, boolean> = {};
    kitchenOrders.forEach(o => {
      updated[o.id] = nextVal;
    });
    setExpandedOrders(updated);
  };

  // Filter orders by search term
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return kitchenOrders;
    const term = searchTerm.toLowerCase().trim();
    return kitchenOrders.filter(o => {
      const matchId = o.id.toLowerCase().includes(term);
      const matchName = o.cliente?.nombre?.toLowerCase().includes(term);
      const matchPhone = o.cliente?.telefono?.toLowerCase().includes(term);
      const matchAddress = o.cliente?.direccion?.toLowerCase().includes(term);
      const matchMesa = o.cliente?.mesa?.toLowerCase().includes(term);
      const matchItems = o.cart.some(item => item.nombre.toLowerCase().includes(term));
      return matchId || matchName || matchPhone || matchAddress || matchMesa || matchItems;
    });
  }, [kitchenOrders, searchTerm]);

  // Channel categorization
  const localOrders = filteredOrders.filter(o => o.pago.tipo === 'local' && !o.pago.programado);
  const mesaOrders = filteredOrders.filter(o => o.pago.tipo === 'mesa' && !o.pago.programado);
  const deliveryOrders = filteredOrders.filter(o => o.pago.tipo === 'envio' && !o.pago.programado);
  const programadosOrders = filteredOrders.filter(o => o.pago.programado);

  // Status categorization
  const prepOrders = filteredOrders.filter(o => o.estado === 'en_proceso' && !isDelayed(o.timestamp));
  const newOrders = filteredOrders.filter(o => (o.estado === 'pendiente' || !o.estado) && !isDelayed(o.timestamp));
  const delayedOrders = filteredOrders.filter(o => isDelayed(o.timestamp));
  const readyOrders = filteredOrders.filter(o => o.estado === 'listo');

  const renderOrderList = (ordersToRender: Order[], title: string, badgeColor: string, isAlert = false) => (
    <div className="flex-1 min-w-[260px] flex flex-col bg-[#0b101e]/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl h-full">
      
      {/* COLUMN HEADER */}
      <div className={`p-3 font-bold tracking-wider text-xs flex justify-between items-center px-4 uppercase shrink-0 border-b ${
        isAlert 
          ? 'bg-red-950/40 border-red-500/30 text-red-300' 
          : 'bg-white/5 border-white/10 text-white'
      }`}>
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
          {title}
        </span>
        <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold ${
          isAlert 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-white/10 text-white'
        }`}>
          {ordersToRender.length}
        </span>
      </div>

      {/* SCROLLABLE ORDER CARDS (PLEGADOS POR DEFECTO PARA MAXIMIZAR ESPACIO) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 p-2.5 custom-scrollbar min-h-0">
        {ordersToRender.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center text-slate-500 text-xs border border-dashed border-white/5 rounded-2xl p-4 text-center">
            <span>Sin comandas en esta estación</span>
          </div>
        ) : (
          ordersToRender.map(order => {
            const delayed = isDelayed(order.timestamp);
            const elapsed = getElapsedMinutes(order.timestamp);
            const totalItemsCount = order.cart.reduce((sum, item) => sum + item.cantidad, 0);
            
            // Default to collapsed unless explicitly toggled or expandAll is true
            const isOpen = expandedOrders[order.id] ?? expandAll;

            return (
              <div 
                key={order.id} 
                className={`bg-[#0d1527] rounded-xl border transition-all overflow-hidden shrink-0 ${
                  delayed 
                    ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* COMPACT CARD SUMMARY HEADER (PLEGADO POR DEFECTO) */}
                <div 
                  onClick={() => toggleOrder(order.id)}
                  className={`p-3 cursor-pointer flex flex-col gap-1.5 transition-colors select-none ${
                    delayed ? 'bg-red-950/50 hover:bg-red-950/70' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm sm:text-base text-white">#{order.id}</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold text-slate-300 font-mono">
                        {totalItemsCount} ítems
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${
                        delayed 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : elapsed > 15 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        <Clock size={11}/> {elapsed}m
                      </span>
                      {isOpen ? <ChevronsUp size={15} className="text-slate-400" /> : <ChevronsDown size={15} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Customer / Location Info Summary */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="font-bold text-slate-200 truncate flex items-center gap-1">
                      <User size={12} className="text-slate-400 shrink-0" />
                      {order.pago.tipo === 'mesa' 
                        ? `MESA ${order.cliente.mesa || '?'}` 
                        : (order.cliente.nombre || 'MOSTRADOR')}
                    </span>
                    {order.cliente.direccion ? (
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px] flex items-center gap-1">
                        <MapPin size={10} className="text-blue-400 shrink-0" />
                        {order.cliente.direccion}
                      </span>
                    ) : order.cliente.telefono ? (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone size={10} className="text-blue-400 shrink-0" />
                        {order.cliente.telefono}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* EXPANDED ACCORDION CONTENT (RECIPES & ACTIONS) */}
                {isOpen && (
                  <div className="p-3 bg-black/50 border-t border-white/5 space-y-3 animate-in fade-in duration-150">
                    {/* Products list */}
                    <ul className="space-y-1.5">
                      {order.cart.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-start text-xs border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                          <div className="font-normal text-slate-200">
                            <span className="text-blue-400 font-extrabold mr-1.5 text-xs font-mono">{item.cantidad}x</span> 
                            <span className="font-semibold text-white">{item.nombre}</span>
                            {item.notas && (
                              <p className="text-[10px] text-amber-300 font-medium mt-0.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                <Info size={10} className="shrink-0 text-amber-400"/> + {item.notas}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Order General Notes */}
                    {order.pago.notas && (
                      <div className="bg-blue-950/30 border border-blue-500/20 p-2 rounded-lg text-[10px] text-blue-200 font-mono">
                        <strong>Nota:</strong> {order.pago.notas}
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order.id, 'kitchen');
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg transition-colors border border-white/10 cursor-pointer"
                          title="Editar comanda en POS"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order.id, 'kitchen');
                          }}
                          className="p-1.5 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors border border-white/10 cursor-pointer"
                          title="Cancelar pedido"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsDone(order.id);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <Check size={14} />
                        <span>✓ LISTO</span>
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

  return (
    <div className="flex-1 bg-[#050505] p-3 sm:p-4 flex flex-col overflow-hidden relative">
      
      {/* TOP KDS BAR (AUTHENTIC BRANDING + SWITCHER + SEARCH + TIME) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0f1c]/90 border border-white/10 rounded-2xl p-3 mb-3 shrink-0 shadow-lg backdrop-blur-md">
        
        {/* LEFT: ICONO RAYO AMARILLO + KDS MONITOR */}
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-amber-400 fill-amber-400" />
          <h2 className="font-bold tracking-widest text-sm uppercase text-slate-100 font-mono">
            KDS MONITOR
          </h2>
        </div>

        {/* CENTER: BUSCADOR POR LUPITA */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar pedido por cliente, mesa o #..."
            className="w-full bg-black/70 border border-white/15 focus:border-blue-500 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* RIGHT: VISTA SWITCHER BUTTON (AL LADO DEL RELOJ) + TOGGLE PLEGAR + RELOJ */}
        <div className="flex items-center gap-2">
          {/* BOTON SWITCHER ENTRE CANALES Y ESTACIONES */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'channels' ? 'status' : 'channels')}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Cambiar vista entre Canales (Retiro, Mesas, Delivery) y Estaciones (Preparación, Nuevos, Demorados, Listos)"
          >
            <SlidersHorizontal size={13} className="text-blue-400" />
            <span>
              {viewMode === 'channels' ? 'Vista: Canales' : 'Vista: Estaciones (Demorados)'}
            </span>
          </button>

          {/* PLEGAR / DESPLEGAR TODOS */}
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
            title={expandAll ? 'Plegar todas las comandas' : 'Desplegar todas las comandas'}
          >
            {expandAll ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>

          {/* RELOJ EN VIVO */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-300 font-mono font-bold">
            <Clock size={13} className="text-slate-400" />
            <span>{clockStr || '20:55'}</span>
          </div>
        </div>
      </div>

      {/* 4 COLUMNS KDS GRID (FULL HEIGHT, PROGRESSIVE SCROLL) */}
      <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden pb-1 min-h-0 custom-scrollbar">
        {viewMode === 'channels' ? (
          <>
            {/* COLUMNA 1: RETIRO LOCAL */}
            {renderOrderList(localOrders, 'Retiro Local', 'bg-blue-400')}

            {/* COLUMNA 2: SALÓN (MESAS) */}
            {renderOrderList(mesaOrders, 'Salón (Mesas)', 'bg-purple-400')}

            {/* COLUMNA 3: DELIVERY */}
            {renderOrderList(deliveryOrders, 'Delivery', 'bg-emerald-400')}

            {/* COLUMNA 4: PROGRAMADOS */}
            {renderOrderList(programadosOrders, 'Programados', 'bg-amber-400')}
          </>
        ) : (
          <>
            {/* COLUMNA 1: EN PREPARACIÓN */}
            {renderOrderList(prepOrders, '🔥 En Preparación', 'bg-amber-400')}

            {/* COLUMNA 2: NUEVOS EN COLA */}
            {renderOrderList(newOrders, '📋 Nuevos en Cola', 'bg-blue-400')}

            {/* COLUMNA 3: DEMORADOS (+30 MIN) */}
            {renderOrderList(delayedOrders, '⚠️ Demorados (+30m)', 'bg-red-500', true)}

            {/* COLUMNA 4: LISTOS PARA ENTREGA */}
            {renderOrderList(readyOrders, '✓ Listos para Entrega', 'bg-emerald-400')}
          </>
        )}
      </div>

    </div>
  );
}
