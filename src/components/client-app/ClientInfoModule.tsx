import React from 'react';
import { 
  MapPin, Phone, Clock, MessageSquare, ShieldCheck, Heart, 
  Sparkles, CheckCircle2, Mail, Utensils, Truck, Store, PhoneCall
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Abierto • Lun a Vie 9:00 a 17:00 hs
              </span>
              <span className="text-[10px] font-mono font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full uppercase">
                🍕 NextCRM App Clientes
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pizzería Gourmet
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Muzzarella artesanal, masa madre leudada 48hs y salsa casera con tomates seleccionados. Haz tu pedido online con geolocalización GPS y sigue el estado de tu comanda en tiempo real.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onGoToMenu}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Utensils size={14} /> Ver Menú & Pedir
              </button>

              <a
                href="https://api.whatsapp.com/send?phone=59898356320&text=Hola%20JPZ,%20quisiera%20hacer%20un%20pedido%20o%20consulta."
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <MessageSquare size={15} /> WhatsApp: 098 356 320
              </a>

              <a
                href="mailto:jpz1207uy@gmail.com"
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail size={14} className="text-purple-400" /> jpz1207uy@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* HORARIOS */}
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-white text-sm uppercase">Horarios de Atención</h3>
            <ul className="text-xs text-slate-300 space-y-1.5 font-sans">
              <li className="flex items-center justify-between border-b border-white/5 pb-1">
                <span>Lunes a Viernes:</span>
                <strong className="text-emerald-400 font-mono">09:00 a 17:00 hs</strong>
              </li>
              <li className="flex items-center justify-between border-b border-white/5 pb-1">
                <span>Sábados y Domingos:</span>
                <span className="text-slate-400 font-mono">Guardia Online</span>
              </li>
              <li className="flex items-center justify-between pt-0.5">
                <span>Pedidos Web:</span>
                <span className="text-cyan-300 font-mono">Disponibles 24hs</span>
              </li>
            </ul>
          </div>

          {/* CONTACTO DIRECTO */}
          <div className="bg-[#0a0f1c] border border-blue-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <PhoneCall size={20} />
            </div>
            <h3 className="font-bold text-white text-sm uppercase">Teléfono & Mail</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Teléfono / WhatsApp:</span>
                <a 
                  href="tel:+59898356320" 
                  className="text-white hover:text-emerald-400 font-bold font-mono text-sm transition-colors flex items-center gap-1.5"
                >
                  <Phone size={13} className="text-emerald-400" /> 098 356 320
                </a>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Correo Electrónico:</span>
                <a 
                  href="mailto:jpz1207uy@gmail.com" 
                  className="text-purple-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 truncate"
                >
                  <Mail size={13} className="text-purple-400 shrink-0" /> jpz1207uy@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* LOCAL & ENVÍOS */}
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-white text-sm uppercase">Ubicación & Delivery</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Atención directa en Montevideo, Uruguay. Envíos a domicilio y retiro en mostrador.
            </p>
            <p className="text-[11px] text-cyan-300 font-mono">
              📍 Detección automática por GPS al pedir
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
