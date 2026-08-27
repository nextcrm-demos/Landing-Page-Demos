import React, { useState } from 'react';
import { Lock, Unlock, Sparkles, ShieldCheck, MessageSquare, Check, ArrowRight, KeyRound, AlertCircle } from 'lucide-react';

interface ModuleLockScreenProps {
  moduleName: string;
  requiredPlan: 'plan_pro' | 'plan_vip';
  currentPlan: 'plan_basico' | 'plan_pro' | 'plan_vip';
  onUpgradeSuccess: (newPlan: 'plan_pro' | 'plan_vip') => void;
}

export function ModuleLockScreen({
  moduleName,
  requiredPlan,
  currentPlan,
  onUpgradeSuccess,
}: ModuleLockScreenProps) {
  const [unlockCode, setUnlockCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const planTitles = {
    plan_basico: 'Plan Básico (Módulo 1)',
    plan_pro: 'Plan Pro (Módulo 2)',
    plan_vip: 'Plan VIP / Ilimitado (Módulo 3)',
  };

  const planRequests = {
    plan_basico: '1 solicitud de soporte/cambio por mes',
    plan_pro: '2 solicitudes de soporte/cambios por mes',
    plan_vip: 'Solicitudes ILIMITADAS (Atención VIP prioritaria)',
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const code = unlockCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'VIP-2026' || code === 'JPZ207UI' || code === 'NEXTCRM-VIP') {
      setSuccessMsg('¡Plan VIP Desbloqueado Exitosamente! Todos los módulos habilitados.');
      setTimeout(() => onUpgradeSuccess('plan_vip'), 800);
    } else if (code === 'PRO-2026' || code === 'NEXTCRM-PRO') {
      if (requiredPlan === 'plan_vip') {
        setErrorMsg('Esta clave es para Plan Pro. Este módulo requiere Plan VIP.');
      } else {
        setSuccessMsg('¡Plan Pro Desbloqueado Exitosamente!');
        setTimeout(() => onUpgradeSuccess('plan_pro'), 800);
      }
    } else {
      setErrorMsg('Clave de activación incorrecta. Solicita tu código a soporte (098 356 320).');
    }
  };

  return (
    <div className="flex-1 bg-[#050505] p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#0a0f1c]/95 border border-white/15 rounded-3xl p-8 shadow-2xl relative text-white text-center space-y-6">
        
        {/* ICON & BADGE */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
            <Lock size={32} />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Módulo Restringido en {planTitles[currentPlan]}
            </span>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mt-2">
              {moduleName}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Este módulo forma parte del <strong className="text-white">{planTitles[requiredPlan]}</strong> de NextCRM.
            </p>
          </div>
        </div>

        {/* PLAN SPECS & SOLICITUDES TRACKING */}
        <div className="bg-black/60 border border-white/10 p-4 rounded-2xl text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between border-b border-white/10 pb-1.5">
            <span className="text-slate-400">Tu Plan Actual:</span>
            <span className="text-white font-bold">{planTitles[currentPlan]}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-1.5">
            <span className="text-slate-400">Cupo de Solicitudes:</span>
            <span className="text-emerald-400 font-bold">{planRequests[currentPlan]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Plan Requerido:</span>
            <span className="text-blue-400 font-bold">{planTitles[requiredPlan]}</span>
          </div>
        </div>

        {/* UNLOCK FORM */}
        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder="Ingresa clave de desbloqueo (ej: PRO-2026, VIP-2026)..."
                className="w-full bg-black/80 border border-white/15 focus:border-blue-500 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={!unlockCode.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Unlock size={14} /> Activar
            </button>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-center gap-1.5">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-center gap-1.5 font-bold">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* WHATSAPP CONTACT BUTTON */}
        <div className="pt-2 border-t border-white/10">
          <a
            href={`https://api.whatsapp.com/send?phone=59898356320&text=${encodeURIComponent(`Hola, quisiera solicitar la habilitación del módulo "${moduleName}" en mi plan de NextCRM.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-white/5 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/40 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={15} className="text-emerald-400" />
            <span>Solicitar Desbloqueo por WhatsApp (098 356 320)</span>
          </a>
        </div>

      </div>
    </div>
  );
}
