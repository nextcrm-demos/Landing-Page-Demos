import React from 'react';
import { 
  MapPin, Phone, Clock, MessageSquare, ShieldCheck, Heart, 
  Sparkles, CheckCircle2, Instagram, Facebook, Utensils, Truck, Store
} from 'lucide-react';

interface ClientInfoModuleProps {
  onGoToMenu: () => void;
}

export function ClientInfoModule({ onGoToMenu }: ClientInfoModuleProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#050505] text-slate-200 font-sans custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HERO CARD */}
        <div className="bg-gradient-to-r from-blue-950/40 via-[#0a0f1c] to-black border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
              🍕 Pizzería Artesanal & Horno a Leña
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pizzería Gourmet Demo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Muzzarella de primera calidad, masa madre leudada 48hs y salsa casera con tomates seleccionados. Hacé tu pedido online y seguí la elaboración de tu comanda en tiempo real.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onGoToMenu}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Ver Menú & Hacer Pedido
              </button>
              <a
                href="https://api.whatsapp.com/send?phone=59898356320&text=Hola,%20quisiera%20hacer%20una%20consulta%20sobre%20mi%20pedido."
                target="_blank"
                rel="noreferrer"
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <MessageSquare size={15} className="text-emerald-400" /> WhatsApp (098 356 320)
              </a>
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* HORARIOS */}
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-white text-sm uppercase">Horarios de Atención</h3>
            <ul className="text-xs text-slate-400 space-y-1 font-mono">
              <li><strong className="text-white">Mar a Dom:</strong> 19:30 a 01:00 hs</li>
              <li><strong className="text-white">Vier y Sáb:</strong> 19:30 a 02:00 hs</li>
              <li><strong className="text-amber-400">Lunes:</strong> Cerrado (Descanso)</li>
            </ul>
          </div>

          {/* LOCAL & ENVÍOS */}
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-white text-sm uppercase">Ubicación & Delivery</h3>
            <p className="text-xs text-slate-400">
              Av. 18 de Julio 1450 esq. Barrios Amorín, Montevideo.
            </p>
            <p className="text-[11px] text-blue-400 font-mono">
              🛵 Cobertura de delivery en todo el radio céntrico y costa.
            </p>
          </div>

          {/* CONTACTO & MEDIOS DE PAGO */}
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-white text-sm uppercase">Medios de Pago</h3>
            <p className="text-xs text-slate-400">
              Aceptamos Efectivo con cambio exacto, tarjetas de Débito y Crédito (POS), y Transferencias bancarias.
            </p>
            <p className="text-[11px] text-emerald-400 font-mono">
              Tel: 098 356 320 • NextCRM App
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
