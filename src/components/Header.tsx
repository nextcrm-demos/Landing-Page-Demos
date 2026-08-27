import React from 'react';
import { 
  DollarSign, Smartphone, ChefHat, Users, FileText, 
  Settings, LogOut, MessageSquare, UtensilsCrossed, 
  Home, ShieldCheck, Lock, Globe, Shield, Sparkles
} from 'lucide-react';
import { TabType, PlanType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onCerrarTurno: () => void;
  kitchenOrdersCount?: number;
  pendingDeliveryCount?: number;
  pendingMostradorCount?: number;
  pendingMesasCount?: number;
  onGoToPresentation?: () => void;
  onSwitchToClientApp?: () => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  userPlan?: PlanType;
  onChangePlan?: (plan: PlanType) => void;
}

export function Header({
  activeTab,
  setActiveTab,
  onCerrarTurno,
  kitchenOrdersCount = 0,
  pendingDeliveryCount = 0,
  pendingMostradorCount = 0,
  pendingMesasCount = 0,
  onGoToPresentation,
  onSwitchToClientApp,
  isAdmin = false,
  onOpenAdminPanel,
  userPlan = 'plan_full',
  onChangePlan,
}: HeaderProps) {
  const tabs: TabType[] = [
    'Mostrador',
    'Mesas',
    'Delivery',
    'Finalizados',
    'Cocina',
    'WhatsApp',
    'Módulo Web',
    'Clientes',
    'Menú',
    'Stock',
    'Facturación',
    'Reportes',
    'Historial',
    'Caja',
    'Soporte'
  ];

  const getPendingBadgeCount = (tab: TabType) => {
    switch (tab) {
      case 'Mostrador': return pendingMostradorCount;
      case 'Delivery': return pendingDeliveryCount;
      case 'Mesas': return pendingMesasCount;
      default: return 0;
    }
  };

  const isTabLocked = (tab: TabType) => {
    if (userPlan === 'plan_full') return false;
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
    <header className="bg-[#070b16]/95 backdrop-blur-xl text-slate-300 font-medium flex items-center px-3 sm:px-5 h-14 shrink-0 z-20 relative w-full justify-between gap-2 select-none shadow-lg">
      
      {/* BRAND & QUICK ACTIONS (LEFT SIDE COMPACT) */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="font-light tracking-[0.15em] text-white text-xs whitespace-nowrap pr-1 flex items-center gap-1.5">
          <span className="text-white font-medium">NEXT</span>
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">
            CRM
          </span>
        </div>
        
        {onGoToPresentation && (
          <button
            onClick={onGoToPresentation}
            title="Volver a la landing page"
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-[11px] transition-all cursor-pointer"
          >
            <Home size={12} />
            <span className="hidden xl:inline">Landing</span>
          </button>
        )}

        {onSwitchToClientApp && (
          <button
            onClick={onSwitchToClientApp}
            title="Probar Aplicación Web de Clientes"
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/25 hover:bg-purple-600 text-purple-200 hover:text-white rounded-xl text-[11px] font-bold transition-all border border-purple-500/40 shadow-sm cursor-pointer"
          >
            <Smartphone size={12} className="text-purple-300" />
            <span className="hidden lg:inline">App Clientes</span>
          </button>
        )}

        {isAdmin && onOpenAdminPanel && (
          <button
            onClick={onOpenAdminPanel}
            title="Panel de Control de Clientes & Demos (Admin)"
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white rounded-xl text-[11px] font-bold transition-all border border-blue-500/40 cursor-pointer"
          >
            <ShieldCheck size={12} className="text-blue-400" />
            <span className="hidden 2xl:inline">Admin</span>
          </button>
        )}

        {/* COMPACT PLAN SIMULATOR PILLS */}
        {onChangePlan && (
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5 gap-0.5 text-[10px] font-mono shrink-0">
            <span className="text-slate-400 px-1.5 hidden 2xl:inline font-bold text-[9px]">Plan:</span>
            {[
              { id: 'plan_basico', label: '1. Básico' },
              { id: 'plan_pro', label: '2. Pro' },
              { id: 'plan_vip', label: '3. VIP' },
              { id: 'plan_full', label: '4. Full' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => onChangePlan(p.id as any)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  userPlan === p.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Simular ${p.label}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* SCROLLABLE / FLEXIBLE TABS BAR */}
      <div className="flex gap-1 h-full items-center flex-1 justify-end overflow-x-auto custom-scrollbar px-1 min-w-0">
        {tabs.map(tab => {
          const badgeCount = getPendingBadgeCount(tab);
          const locked = isTabLocked(tab);

          return (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 relative text-[11px] tracking-normal whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black shadow-md ring-1 ring-purple-400/40' 
                  : 'hover:bg-white/5 hover:text-white text-slate-400'
              }`}
            >
              {tab === 'Módulo Web' && <Globe size={11} className="text-purple-400 shrink-0" />}
              <span>{tab}</span>
              {locked && <Lock size={10} className="text-amber-400 shrink-0 ml-0.5" />}
              
              {tab === 'Cocina' && kitchenOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse ml-0.5 font-mono font-bold">
                  {kitchenOrdersCount}
                </span>
              )}
              {['Mostrador', 'Mesas', 'Delivery'].includes(tab) && badgeCount > 0 && (
                <span className="bg-emerald-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full ml-0.5 font-mono font-bold">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
        
        <button 
          onClick={onCerrarTurno} 
          className="ml-1 px-3 py-1.5 bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold tracking-normal whitespace-nowrap border border-red-500/30 cursor-pointer shrink-0"
        >
           <LogOut size={11}/> <span className="hidden sm:inline">Cerrar Turno</span>
        </button>
      </div>
    </header>
  );
}
