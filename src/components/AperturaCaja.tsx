import React, { useState } from 'react';
import { Layers, Zap, Wallet, AlertTriangle, ArrowRight, Package, Home, Lock, User, KeyRound, Sparkles, X, Mail, Phone, Building, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { MenuItem } from '../types';
import { loginWithUserOrEmail, saveDemoRequest } from '../lib/firebase';

interface AperturaCajaProps {
  showOpeningForm: boolean;
  setShowOpeningForm: (show: boolean) => void;
  cajeroName: string;
  setCajeroName: (name: string) => void;
  openingCash: string;
  setOpeningCash: (val: string) => void;
  openingError: string;
  thresholds: { general: number; bebidas: number; postres: number };
  setThresholds: React.Dispatch<React.SetStateAction<{ general: number; bebidas: number; postres: number }>>;
  initialStockSetup: Record<string, string>;
  setInitialStockSetup: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  menuItems: MenuItem[];
  onOpenRegister: () => void;
  onGoToPresentation?: () => void;
}

export function AperturaCaja({
  showOpeningForm,
  setShowOpeningForm,
  cajeroName,
  setCajeroName,
  openingCash,
  setOpeningCash,
  openingError,
  thresholds,
  setThresholds,
  initialStockSetup,
  setInitialStockSetup,
  menuItems,
  onOpenRegister,
  onGoToPresentation
}: AperturaCajaProps) {
  const [loginMode, setLoginMode] = useState<'nombre' | 'correo'>('nombre');
  const [nombreVal, setNombreVal] = useState('');
  const [correoVal, setCorreoVal] = useState('');
  const [cajeroPassword, setCajeroPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Demo request modal state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoNombre, setDemoNombre] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoTelefono, setDemoTelefono] = useState('');
  const [demoNegocio, setDemoNegocio] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoError, setDemoError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginMode === 'nombre' ? nombreVal.trim() : correoVal.trim();

    if (!identifier) {
      setLoginError(
        loginMode === 'nombre' 
          ? 'Por favor, ingresa tu nombre de usuario o encargado' 
          : 'Por favor, ingresa tu correo electrónico'
      );
      return;
    }

    if (loginMode === 'correo' && !identifier.includes('@')) {
      setLoginError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoginError('');
    setIsLoggingIn(true);

    try {
      setCajeroName(identifier);
      await loginWithUserOrEmail(identifier, cajeroPassword || '1234');
      setIsLoggingIn(false);
      setShowOpeningForm(true);
    } catch (err) {
      setIsLoggingIn(false);
      setShowOpeningForm(true);
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoNombre.trim() || !demoEmail.trim()) {
      setDemoError('Por favor completa tu nombre y correo electrónico.');
      return;
    }
    setDemoError('');
    setDemoLoading(true);

    const res = await saveDemoRequest({
      nombre: demoNombre.trim(),
      email: demoEmail.trim(),
      telefono: demoTelefono.trim(),
      negocio: demoNegocio.trim(),
    });

    setDemoLoading(false);
    if (res.success) {
      setDemoSubmitted(true);
    } else {
      setDemoError('Hubo un error al enviar la solicitud. Por favor reintenta.');
    }
  };

  if (!showOpeningForm) {
    return (
      <div className="min-h-screen w-full bg-[#0d1322] text-[rgba(255,255,255,0.87)] flex flex-col items-center justify-center p-6 font-sans relative">
        {onGoToPresentation && (
          <button
            onClick={onGoToPresentation}
            className="absolute top-6 left-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer backdrop-blur-md z-10"
          >
            <Home size={15} /> Volver a Landing / Presentación
          </button>
        )}

        <div className="relative w-40 h-40 flex items-center justify-center mb-6 [perspective:1000px] mt-4">
          <div className="absolute top-4 w-28 h-28 bg-transparent border-[3px] border-slate-700/50 rounded-3xl flex items-center justify-center z-20 [transform:rotateX(60deg)_rotateZ(45deg)] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <div className="[transform:rotateZ(-45deg)_rotateX(-60deg)]">
              <Layers size={36} className="text-[#00d8ff]" />
            </div>
          </div>
          <div className="absolute bottom-4 w-28 h-28 bg-[#2a1b38] border-[3px] border-[#646cff]/50 rounded-3xl flex items-center justify-center z-10 [transform:rotateX(60deg)_rotateZ(45deg)] shadow-[0_20px_50px_rgba(100,108,255,0.4)]">
            <div className="[transform:rotateZ(-45deg)_rotateX(-60deg)]">
              <Zap size={28} className="text-[#646cff]" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white text-center">
          NEXT CRM
        </h1>
        <p className="text-[#b3b3b3] text-sm md:text-base mb-6 text-center max-w-sm">
          Elige la modalidad de ingreso a la demo:
        </p>

        <form 
          onSubmit={handleLoginSubmit} 
          className="flex flex-col gap-5 w-full max-w-md md:max-w-lg bg-white/5 p-7 md:p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          {/* Selector de modo: Con Nombre vs Con Correo */}
          <div className="bg-black/50 p-1.5 rounded-xl border border-white/10 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLoginMode('nombre');
                if (loginError) setLoginError('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMode === 'nombre'
                  ? 'bg-blue-600 text-white shadow-lg border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={15} /> Con Nombre
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('correo');
                if (loginError) setLoginError('');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loginMode === 'correo'
                  ? 'bg-blue-600 text-white shadow-lg border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail size={15} /> Con Correo
            </button>
          </div>

          {loginError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs py-2.5 px-4 rounded-xl text-center font-medium leading-relaxed">
              {loginError}
            </div>
          )}

          {loginMode === 'nombre' ? (
            <div className="text-center">
              <label className="block text-[11px] uppercase tracking-widest text-slate-300 mb-2 font-medium flex items-center justify-center gap-2 text-center">
                <User size={14} className="text-blue-400" /> Nombre de Usuario / Encargado
              </label>
              <input
                type="text"
                value={nombreVal}
                onChange={(e) => {
                  setNombreVal(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="Ej. Juan Pérez o admin"
                className="bg-black/50 border border-white/15 focus:border-[#646cff] hover:border-white/30 transition-colors rounded-xl py-3.5 px-4 text-white outline-none w-full text-center font-medium text-sm shadow-inner"
                autoFocus
              />
            </div>
          ) : (
            <div className="text-center">
              <label className="block text-[11px] uppercase tracking-widest text-slate-300 mb-2 font-medium flex items-center justify-center gap-2 text-center">
                <Mail size={14} className="text-blue-400" /> Correo Electrónico
              </label>
              <input
                type="email"
                value={correoVal}
                onChange={(e) => {
                  setCorreoVal(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="Ej. usuario@pizzeria.com"
                className="bg-black/50 border border-white/15 focus:border-[#646cff] hover:border-white/30 transition-colors rounded-xl py-3.5 px-4 text-white outline-none w-full text-center font-medium text-sm shadow-inner"
                autoFocus
              />
            </div>
          )}

          <div className="text-center">
            <label className="block text-[11px] uppercase tracking-widest text-slate-300 mb-2 font-medium flex items-center justify-center gap-2 text-center">
              <KeyRound size={14} className="text-blue-400" /> Contraseña
            </label>
            <input
              type="password"
              value={cajeroPassword}
              onChange={(e) => {
                setCajeroPassword(e.target.value);
                if (loginError) setLoginError('');
              }}
              placeholder="••••••••"
              className="bg-black/50 border border-white/15 focus:border-[#646cff] hover:border-white/30 transition-colors rounded-xl py-3.5 px-4 text-white outline-none w-full text-center font-medium text-sm shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-2 py-3.5 px-6 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl active:scale-[0.98] disabled:opacity-50"
          >
            <Lock size={16} /> {isLoggingIn ? 'Iniciando...' : `Ingresar con ${loginMode === 'nombre' ? 'Nombre' : 'Correo'}`}
          </button>
        </form>

        {/* Modal de Solicitud de Demo */}
        {showDemoModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-[#10172a] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl text-white relative animate-fade-in">
              <button 
                onClick={() => { setShowDemoModal(false); setDemoSubmitted(false); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {!demoSubmitted ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Solicitar Acceso Demo</h3>
                      <p className="text-xs text-slate-400">Déjanos tu correo para crearte un usuario personalizado.</p>
                    </div>
                  </div>

                  <form onSubmit={handleDemoSubmit} className="space-y-3.5 mt-4">
                    {demoError && (
                      <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs p-2.5 rounded-lg text-center font-medium">
                        {demoError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <User size={12} className="text-emerald-400" /> Nombre Completo *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={demoNombre} 
                        onChange={(e) => setDemoNombre(e.target.value)}
                        placeholder="Ej: Juan Pérez" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Mail size={12} className="text-emerald-400" /> Correo Electrónico *
                      </label>
                      <input 
                        type="email" 
                        required
                        value={demoEmail} 
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="tu@ejemplo.com" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Phone size={12} className="text-emerald-400" /> Teléfono / WhatsApp (Opcional)
                      </label>
                      <input 
                        type="tel" 
                        value={demoTelefono} 
                        onChange={(e) => setDemoTelefono(e.target.value)}
                        placeholder="+54 9 11 1234 5678" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                        <Building size={12} className="text-emerald-400" /> Nombre del Negocio / Pizzería (Opcional)
                      </label>
                      <input 
                        type="text" 
                        value={demoNegocio} 
                        onChange={(e) => setDemoNegocio(e.target.value)}
                        placeholder="Pizzería Don Carlos" 
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setShowDemoModal(false)}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={demoLoading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {demoLoading ? 'Enviando...' : <><Send size={14} /> Enviar Solicitud</>}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white">¡Solicitud Enviada!</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                    Guardamos tu correo <span className="text-emerald-400 font-semibold">{demoEmail}</span>. Te crearemos un usuario personalizado para ingresar a la demo.
                  </p>
                  <button
                    onClick={() => { setShowDemoModal(false); setDemoSubmitted(false); }}
                    className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    Entendido
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-2 md:p-4 relative">
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      
      {openingError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-md text-white font-medium px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-pulse border border-red-400 w-max text-sm">
          <AlertTriangle size={20}/> {openingError}
        </div>
      )}
      <div className="bg-[#0a0f1c]/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10">
        <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-light tracking-[0.2em] text-white uppercase">APERTURA DE CAJA - {cajeroName}</h2>
          {onGoToPresentation && (
            <button
              onClick={onGoToPresentation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg text-xs transition-all border border-white/10 cursor-pointer"
            >
              <Home size={14} /> Landing
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold tracking-widest text-slate-300 uppercase flex items-center gap-1.5">
                  <Wallet size={14} className="text-emerald-400" /> Efectivo Inicial en Caja
                </label>
                <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  * Obligatorio
                </span>
              </div>
              
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-light text-xl">$</span>
                <input 
                  type="number" 
                  value={openingCash} 
                  onChange={(e) => setOpeningCash(e.target.value)} 
                  placeholder="Ej: 2000"
                  className="w-full bg-black/50 border border-white/15 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-2xl font-bold text-emerald-400 outline-none transition-colors" 
                  autoFocus
                />
              </div>

              {/* Botones rápidos de importe demo */}
              <div className="grid grid-cols-3 gap-1.5">
                {[1000, 2000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOpeningCash(String(preset))}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      openingCash === String(preset)
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm flex-1 flex flex-col">
              <label className="text-[10px] font-light tracking-widest text-slate-400 mb-4 uppercase flex items-center gap-2">
                <AlertTriangle size={14}/> Umbrales de Alerta (%)
              </label>
              <div className="space-y-3 flex-1">
                {(['general', 'bebidas', 'postres'] as const).map(t => (
                  <div key={t} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wide">{t}</span>
                    <div className="relative w-20">
                      <input 
                        type="number" 
                        value={thresholds[t]} 
                        onChange={e => setThresholds({...thresholds, [t]: Number(e.target.value) || 0})} 
                        className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-2 pr-6 text-right font-medium text-blue-400 text-sm outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={onOpenRegister} 
              className="bg-blue-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-950/40 text-xs tracking-widest uppercase flex items-center justify-center gap-3 w-full mt-auto cursor-pointer active:scale-[0.98]"
            >
              ABRIR CAJA <ArrowRight size={18}/>
            </button>
          </div>

          <div className="flex-1 flex flex-col bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <label className="text-[10px] font-light tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <Package size={14} className="text-blue-400" /> Conteo Inicial de Stock
              </label>
              <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                Opcional (se conserva el stock actual si no se edita)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 flex-1 overflow-y-auto content-start pr-2 custom-scrollbar">
              {menuItems.map(item => (
                <div key={item.id} className="flex flex-col bg-black/20 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                  <span className="truncate font-medium text-slate-300 text-[11px] mb-2" title={item.nombre}>{item.nombre}</span>
                  <input 
                    type="number" 
                    placeholder="Auto" 
                    className="w-full border border-white/10 rounded-lg p-2 text-center font-semibold text-lg text-blue-400 outline-none bg-black/40 focus:border-blue-500 transition-colors" 
                    value={initialStockSetup[item.id] || ''} 
                    onChange={(e) => setInitialStockSetup({...initialStockSetup, [item.id]: e.target.value})} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
