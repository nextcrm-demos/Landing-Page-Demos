import React from 'react';
import { LogOut, Home, ShieldCheck, Lock, Globe } from 'lucide-react';
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
  userPlan?: 'plan_basico' | 'plan_pro' | 'plan_vip' | 'plan_full';
}

export function Header({
  activeTab,
  setActiveTab,
  kitchenOrdersCount,
  readyOrders,
  onCerrarTurno,
  onGoToPresentation,
  isAdmin = false,
  onOpenAdminPanel,
  userPlan = 'plan_full',
}: HeaderProps) {
  const tabs = [
    'Toma de Pedidos', 'WhatsApp', 'Módulo Web', 'Cocina', 'Mostrador', 'Mesas', 'Delivery', 
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

  const isTabLocked = (tab: string) => {
    if (isAdmin || userPlan === 'plan_full') return false;
    if (userPlan === 'plan_basico') {
      return ['WhatsApp', 'Módulo Web', 'Cocina', 'Stock', 'Facturación', 'Reportes'].includes(tab);
    }
    if (userPlan === 'plan_pro') {
      return ['Módulo Web', 'Facturación'].includes(tab);
    }
    if (userPlan === 'plan_vip') {
      return ['Módulo Web'].includes(tab);
    }
    return false;
  };

  return (
    <header className="bg-[#0a0f1c]/95 backdrop-blur-xl text-slate-300 font-medium flex items-center px-3 sm:px-5 h-14 shrink-0 border-b border-white/10 z-20 relative w-full justify-between gap-2 select-none">
      
      {/* BRAND & QUICK ACTIONS (FIXED LEFT SIDE) */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="font-light tracking-[0.2em] text-white text-xs sm:text-sm whitespace-nowrap">
          NEXT <span className="font-bold text-blue-400">CRM</span>
        </div>
        
        {onGoToPresentation && (
          <button
            onClick={onGoToPresentation}
            title="Volver a la landing page de presentación"
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-lg text-[11px] transition-all border border-white/10 cursor-pointer"
          >
            <Home size={12} />
            <span className="hidden lg:inline">Landing</span>
          </button>
        )}

        {isAdmin && onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            title="Panel de Control de Clientes & Demos (Admin)"
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white rounded-lg text-[11px] font-bold transition-all border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)] cursor-pointer"
          >
            <ShieldCheck size={13} className="text-blue-400" />
            <span>Admin Demos</span>
          </button>
        )}
      </div>
      
      {/* SCROLLABLE / FLEXIBLE TABS BAR */}
      <div className="flex gap-1 h-full items-center flex-1 justify-end overflow-x-auto custom-scrollbar px-1">
        {tabs.map(tab => {
          const badgeCount = getPendingBadgeCount(tab);
          const locked = isTabLocked(tab);

          return (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 relative text-[11px] tracking-normal whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white font-bold shadow-md ring-1 ring-blue-400/50' 
                  : 'hover:bg-white/5 hover:text-white text-slate-400'
              }`}
            >
              {tab === 'Módulo Web' && <Globe size={11} className="text-purple-400 shrink-0" />}
              <span>{tab}</span>
              {locked && <Lock size={10} className="text-amber-400 shrink-0 ml-0.5" />}
              
              {tab === 'Cocina' && kitchenOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse ml-0.5">
                  {kitchenOrdersCount}
                </span>
              )}
              {['Mostrador', 'Mesas', 'Delivery'].includes(tab) && badgeCount > 0 && (
                <span className="bg-orange-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full ml-0.5">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
        
        <div className="w-px h-5 bg-white/10 mx-1 shrink-0"></div>
        
        <button 
          onClick={onCerrarTurno} 
          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-600 text-red-300 hover:text-white rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold tracking-normal whitespace-nowrap border border-red-500/30 cursor-pointer shrink-0"
        >
           <LogOut size={12}/> Cerrar Turno
        </button>
      </div>
    </header>
  );
}
