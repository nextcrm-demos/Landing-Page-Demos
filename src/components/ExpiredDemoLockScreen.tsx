import React, { useState } from 'react';
import { Lock, Clock, MessageSquare, ShieldAlert, KeyRound, ExternalLink, RefreshCw } from 'lucide-react';
import { verifyDemoAccess, clearLocalDemoSession } from '../lib/firebase';

interface ExpiredDemoLockScreenProps {
  clientName?: string;
  onUnlocked: () => void;
  onGoToLanding: () => void;
}

export function ExpiredDemoLockScreen({
  clientName,
  onUnlocked,
  onGoToLanding
}: ExpiredDemoLockScreenProps) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await verifyDemoAccess(adminUser, adminPass);
      if (res.allowed) {
        onUnlocked();
      } else {
        setErrorMsg(res.message || 'Credenciales inválidas.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearLocalDemoSession();
    onGoToLanding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505] text-white select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-[#0a0f1c] border border-red-500/20 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-center">
        
        {/* Lock Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock size={36} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
          Período de Prueba Finalizado
        </h1>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          {clientName ? `Estimado ${clientName}, tu` : 'Tu'} período de acceso a la <strong className="text-white">Demo de 24 Horas</strong> para NextCrm Pizzería ha expirado.
        </p>

        {/* WhatsApp & Contact CTA */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-4 mb-6">
          <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
            <Clock size={18} />
            <span>¿Deseas activar tu licencia oficial o solicitar una extensión?</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Contrata el sistema completo con comandas ilimitadas, facturación electrónica DGI, KDS de cocina, pedidos por voz y control total de stock.
          </p>

          <a
            href="https://wa.me/59898356320?text=Hola!%20Se%20venci%C3%B3%20mi%20demo%20de%2024%20horas%20de%20NextCrm%20Pizzer%C3%ADa%20y%20quiero%20contratar%20la%20licencia%20oficial%20o%20extender%20el%20acceso."
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>Contactar por WhatsApp (098 356 320)</span>
          </a>
        </div>

        {/* Alternate login & Admin bypass */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          {!showAdminLogin ? (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <button
                onClick={handleLogout}
                className="hover:text-white underline cursor-pointer"
              >
                Volver a la página principal
              </button>
              <span>•</span>
              <button
                onClick={() => setShowAdminLogin(true)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <KeyRound size={13} />
                <span>Acceso Administrador (JPZ)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminAuth} className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-3 text-left animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Acceso Administrador General
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                  {errorMsg}
                </p>
              )}

              <input
                type="text"
                required
                placeholder="Correo o Usuario (jpz1207uy@gmail.com / JPZ207UI)"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                >
                  {isLoading ? 'Verificando...' : 'Ingresar como Admin'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
