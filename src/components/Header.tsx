import React from 'react';
import { LogOut, Home, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  kitchenOrdersCount: number;
  readyOrders: Order[];
  onCerrarTurno: () => void;
  onGoToPresentation?: () => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  kitchenOrdersCount,
  readyOrders,
  onCerrarTurno,
  onGoToPresentation,
  isAdmin = false,
  onOpenAdminPanel
}: HeaderProps) {
  const tabs = [
    'Toma de Pedidos', 'Cocina', 'Mostrador', 'Mesas', 'Delivery', 
    'Finalizados', 'Clientes', 'Menú', 'Stock', 'Facturación', 'Reportes', 
    'Historial', 'Caja', 'Soporte'
  ];

  const getPendingBadgeCount = (tab: string) => {
    return readyOrders.filter(o => {
      if (tab === 'Mostrador') return o.pago.tipo === 'local';
      if (tab === 'Mesas') return o.pago.tipo === 'mesa';
      if (tab === 'Delivery') return o.pago.tipo === 'envio';
      return false;
    }).length;
  };

  return (
    <header className="bg-[#0a0f1c]/80 backdrop-blur-xl text-slate-300 font-medium flex items-center px-6 h-16 shrink-0 border-b border-white/10 z-20 relative">
      <div className="flex items-center gap-3 mr-6 shrink-0">
        <div className="font-light tracking-[0.2em] text-white text-sm">NEXT CRM</div>
        {onGoToPresentation && (
          <button
            onClick={onGoToPresentation}
            title="Volver a la landing page de presentación"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg text-xs transition-all border border-white/10 cursor-pointer"
          >
            <Home size={13} />
            <span className="hidden sm:inline">Landing</span>
          </button>
        )}
        {isAdmin && onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            title="Panel de Control de Clientes & Demos (Admin)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white rounded-lg text-xs transition-all border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)] cursor-pointer"
          >
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="font-bold">Clientes Demo (Admin)</span>
          </button>
        )}
      </div>
      
      <div className="flex gap-1 h-full items-center ml-auto overflow-x-auto hide-scrollbar">
        {tabs.map(tab => {
          const badgeCount = getPendingBadgeCount(tab);
          return (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 relative text-xs tracking-wide whitespace-nowrap cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'hover:bg-white/5 hover:text-white text-slate-400'
              }`}
            >
              {tab}
              {tab === 'Cocina' && kitchenOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                  {kitchenOrdersCount}
                </span>
              )}
              {['Mostrador', 'Mesas', 'Delivery'].includes(tab) && badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
        
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        
        <button 
          onClick={onCerrarTurno} 
          className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs tracking-wide whitespace-nowrap border border-red-500/20 cursor-pointer"
        >
           <LogOut size={14}/> Cerrar Turno
        </button>
      </div>
    </header>
  );
}
