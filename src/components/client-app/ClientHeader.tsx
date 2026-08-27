import React, { useState } from 'react';
import { ShoppingBag, Clock, MapPin, PhoneCall, Home, Sparkles, User, LogOut, Check, X, ShieldCheck, Truck, UtensilsCrossed } from 'lucide-react';
import { OrderClient } from '../../types';

interface ClientHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  activeOrdersCount: number;
  onGoToPresentation: () => void;
  currentOrderClient?: OrderClient;
  onSetClientUser?: (user: { nombre: string; telefono: string; direccion: string; email: string }) => void;
  onSwitchToCRM?: () => void;
}

export function ClientHeader({
  activeTab,
  setActiveTab,
  cartCount,
  activeOrdersCount,
  onGoToPresentation,
  onSetClientUser,
  onSwitchToCRM,
}: ClientHeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ nombre: string; telefono: string; direccion: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('next_crm_client_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loginForm, setLoginForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: '',
  });

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.nombre.trim()) return;

    const userObj = {
      nombre: loginForm.nombre.trim(),
      telefono: loginForm.telefono.trim(),
      direccion: loginForm.direccion.trim(),
      email: loginForm.email.trim(),
    };
    setCurrentUser(userObj);
    localStorage.setItem('next_crm_client_user', JSON.stringify(userObj));
    if (onSetClientUser) onSetClientUser(userObj);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('next_crm_client_user');
    setIsAuthModalOpen(false);
  };

  return (
    <header className="bg-[#070b16]/95 backdrop-blur-xl text-slate-200 font-sans z-30 sticky top-0 shadow-lg select-none">
      
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-indigo-950/40 text-blue-300 text-[10px] px-3 py-1 flex flex-wrap items-center justify-between gap-1.5 font-mono">
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ABIERTO • HORNO ENCENDIDO
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
            <Clock size={11} className="text-purple-400" /> Horarios: 19:30 - 01:00 hs
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
            <MapPin size={11} className="text-cyan-400" /> Envíos a Domicilio y Retiro
          </span>
        </div>
        <div className="flex items-center gap-2 mx-auto sm:mx-0 text-[10px] text-slate-400">
          <span>Demora promedio: <strong className="text-cyan-300 font-bold">25-35 min</strong></span>
        </div>
      </div>

      {/* MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
        
        {/* BRAND LOGO */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-white text-base shadow-sm">
            🍕
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-tight">Pizzería Gourmet</span>
              <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                App Clientes
              </span>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Menú & Pedir
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeTab === 'tracking'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Truck size={13} className="text-cyan-400" />
            <span>Seguimiento</span>
            {activeOrdersCount > 0 && (
              <span className="w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            El Local
          </button>
        </div>

        {/* USER PROFILE & BACK TO CRM / LANDING */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold cursor-pointer"
            >
              <User size={13} />
              <span className="truncate max-w-[100px]">{currentUser.nombre.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold cursor-pointer"
            >
              <User size={13} />
              <span>Ingresar</span>
            </button>
          )}

          {onSwitchToCRM && (
            <button
              onClick={onSwitchToCRM}
              title="Volver a la vista del Administrador / POS / KDS"
              className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <UtensilsCrossed size={12} />
              <span className="hidden sm:inline">Modo CRM / POS</span>
            </button>
          )}

          {onGoToPresentation && (
            <button
              onClick={onGoToPresentation}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl text-[11px] font-bold cursor-pointer"
              title="Volver a la landing page"
            >
              <Home size={12} />
            </button>
          )}
        </div>

      </div>

      {/* USER LOGIN / REGISTER MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white relative">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer p-1"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/30">
                <User size={22} />
              </div>
              <h3 className="text-base font-black uppercase tracking-wider">
                {currentUser ? 'Perfil de Cliente' : 'Tu Cuenta de Pedidos'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Guarda tus datos para pedir en 1 clic y seguir tus envíos
              </p>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                <div className="bg-black/50 border border-white/10 p-3 rounded-2xl space-y-1.5 text-xs font-mono">
                  <p><strong className="text-slate-400">Nombre:</strong> {currentUser.nombre}</p>
                  <p><strong className="text-slate-400">Teléfono:</strong> {currentUser.telefono}</p>
                  <p><strong className="text-slate-400">Dirección:</strong> {currentUser.direccion}</p>
                  {currentUser.email && <p><strong className="text-slate-400">Email:</strong> {currentUser.email}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveUser} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Marcelo Gómez"
                    value={loginForm.nombre}
                    onChange={(e) => setLoginForm({ ...loginForm, nombre: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 099 123 456"
                    value={loginForm.telefono}
                    onChange={(e) => setLoginForm({ ...loginForm, telefono: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-bold">
                    Dirección de Entrega Predeterminada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Jackson 1420 apto 402"
                    value={loginForm.direccion}
                    onChange={(e) => setLoginForm({ ...loginForm, direccion: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer mt-2"
                >
                  Guardar y Continuar
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
