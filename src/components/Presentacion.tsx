import React, { useState } from 'react';
import { 
  ArrowDown, ChevronsDown, Pointer, Zap, Wallet, Heart, Download, 
  Package, Users, MessageSquare, CheckCircle, Info, Rocket, X, Mail, User, Building, Send, Clock, Sparkles, LogIn, ExternalLink, ShieldCheck, KeyRound, Copy, Check, Lock, AlertCircle,
  Mic, Cpu, Layers, Database, Globe, Code2, Headphones, HelpCircle, Flame, CheckCircle2, ChevronRight, DollarSign, RotateCcw, CreditCard, Printer, FileText, BarChart3, Receipt, Box, Smartphone
} from 'lucide-react';
import { saveDemoRequest, verifyDemoAccess, getLocalDemoSession } from '../lib/firebase';

interface PresentacionProps {
  onStartDemo: (initialMode?: 'crm' | 'client_app') => void;
}

export function Presentacion({ onStartDemo }: PresentacionProps) {
  const [showModal, setShowModal] = useState(false);
  const [showClientAccessModal, setShowClientAccessModal] = useState(false);
  const [showDemoAccessModal, setShowDemoAccessModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [clientUrlInput, setClientUrlInput] = useState('');
  const [email, setEmail] = useState('');
  const [negocio, setNegocio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Demo access gate verification state
  const [demoAuthInput, setDemoAuthInput] = useState('');
  const [demoPasswordInput, setDemoPasswordInput] = useState('');
  const [demoAuthError, setDemoAuthError] = useState('');
  const [demoAuthSuccess, setDemoAuthSuccess] = useState('');
  const [isVerifyingDemo, setIsVerifyingDemo] = useState(false);

  // Multi-step Voice dictation demo in landing
  const [demoVoiceItems, setDemoVoiceItems] = useState([
    { qty: 1, name: '1 Metro Pizza Muzzarella', notes: '+ Panceta y Aceitunas', price: 820 }
  ]);
  const [demoActiveText, setDemoActiveText] = useState('1 metro de muzza con panceta y aceitunas');

  const addVoiceDemoChunk = (text: string, qty: number, name: string, notes: string, price: number) => {
    setDemoActiveText(text);
    setDemoVoiceItems(prev => [...prev, { qty, name, notes, price }]);
  };

  const resetVoiceDemo = () => {
    setDemoVoiceItems([{ qty: 1, name: '1 Metro Pizza Muzzarella', notes: '+ Panceta y Aceitunas', price: 820 }]);
    setDemoActiveText('1 metro de muzza con panceta y aceitunas');
  };

  const totalDemoPrice = demoVoiceItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await saveDemoRequest({
        nombre: 'Acceso Demo',
        email: email.trim(),
        negocio: negocio.trim() || 'Pizzería Demo',
        timestamp: Date.now(),
        status: 'aprobado',
        modoAcceso: 'correo'
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setDemoAuthInput(email.trim());
      const msg = encodeURIComponent(
        `Hola JPZ / NextCrm, solicito habilitación de usuario y contraseña para la demo de 24hs de NextCrm Pizzería.\n\n• Correo/Usuario: ${email.trim()}\n• Pizzería/Negocio: ${negocio.trim() || 'No especificado'}`
      );
      window.open(`https://api.whatsapp.com/send?phone=59898356320&text=${msg}`, '_blank');
    } catch (err) {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const [verifiedAccountData, setVerifiedAccountData] = useState<any>(null);
  const [targetLaunchMode, setTargetLaunchMode] = useState<'crm' | 'client_app'>('crm');
  const [showPlan4RequiredModal, setShowPlan4RequiredModal] = useState(false);

  const handleLaunchDemo = (mode: 'crm' | 'client_app') => {
    const session = getLocalDemoSession();

    // 1. If no active session or expired, require demo access gate
    if (!session.isValid || session.isExpired) {
      setTargetLaunchMode(mode);
      setShowDemoAccessModal(true);
      return;
    }

    // 2. If requesting App Clientes but account does not have Plan 4 and is not Admin
    if (mode === 'client_app' && !session.isAdmin && session.plan && session.plan !== 'plan_full') {
      setShowPlan4RequiredModal(true);
      return;
    }

    onStartDemo(mode);
  };

  const handleVerifyDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoAuthError('');
    setDemoAuthSuccess('');

    if (!demoAuthInput.trim()) {
      setDemoAuthError('Ingresa el correo o usuario de tu cuenta demo.');
      return;
    }

    setIsVerifyingDemo(true);
    try {
      const result = await verifyDemoAccess(demoAuthInput, demoPasswordInput);
      if (result.allowed) {
        setDemoAuthSuccess(result.message);
        setVerifiedAccountData(result.account || {
          clienteNombre: 'Cliente Demo',
          negocioNombre: 'Pizzería Gourmet',
          duracionHoras: 24,
          plan: result.account?.plan || 'plan_full'
        });
      } else {
        setDemoAuthError(result.message);
      }
    } catch (err: any) {
      setDemoAuthError('Error al verificar el acceso. Intenta de nuevo.');
    } finally {
      setIsVerifyingDemo(false);
    }
  };

  const handleClientRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    const input = clientUrlInput.trim().toLowerCase();
    if (!input) return;

    if (input.startsWith('http://') || input.startsWith('https://')) {
      window.open(input, '_blank');
    } else if (input.includes('.')) {
      window.open(`https://${input}`, '_blank');
    } else {
      window.open(`https://${input}.vercel.app`, '_blank');
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-white font-sans overflow-x-hidden overflow-y-auto snap-y snap-mandatory selection:bg-blue-600 selection:text-white scroll-smooth relative">
      
      {/* BARRA SUPERIOR FIJA / HEADER AUTHENTIC NEXTCRM */}
      <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Layers size={18} />
          </div>
          <div>
            <span className="font-light tracking-[0.2em] text-sm sm:text-base text-white uppercase">
              NEXT <span className="font-bold text-blue-400">CRM</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDemoAccessModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <Rocket size={14} className="stroke-[2.5]" /> Acceso a Demo
          </button>

          <button
            onClick={() => setShowClientAccessModal(true)}
            className="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-full border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogIn size={14} /> Acceso Clientes
          </button>
        </div>
      </header>

      {/* PANTALLA 1: HERO - TEMA NEGRO ORIGINAL CON LOGO NEXTCRM 3D */}
      <section id="seccion-hero" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col items-center justify-center relative px-6 text-center bg-[#050505]">
        
        {/* LOGO ISOMÉTRICO 3D NEXTCRM */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-5 [perspective:1000px] shrink-0">
          <div className="absolute top-2 w-18 h-18 sm:w-22 sm:h-22 bg-transparent border-[2.5px] border-slate-700/50 rounded-2xl flex items-center justify-center z-20 [transform:rotateX(60deg)_rotateZ(45deg)] shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <div className="[transform:rotateZ(-45deg)_rotateX(-60deg)]">
              <Layers size={26} className="text-[#00d8ff]" />
            </div>
          </div>
          <div className="absolute bottom-2 w-18 h-18 sm:w-22 sm:h-22 bg-[#1a233a] border-[2.5px] border-blue-500/50 rounded-2xl flex items-center justify-center z-10 [transform:rotateX(60deg)_rotateZ(45deg)] shadow-[0_20px_50px_rgba(59,130,246,0.4)]">
            <div className="[transform:rotateZ(-45deg)_rotateX(-60deg)]">
              <Zap size={20} className="text-blue-400" />
            </div>
          </div>
        </div>

        {/* BADGE DELICADO Y FINO */}
        <div className="inline-flex items-center gap-2 border border-blue-500/20 text-blue-300 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase px-3.5 py-1 rounded-full mb-6 bg-blue-500/5 backdrop-blur-sm">
          <Sparkles size={11} className="text-blue-400" /> Software Gastronómico Premium + Pedidos por Voz con IA
        </div>

        {/* TÍTULO PRINCIPAL GRANDE E IMPONENTE */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-center mb-6 tracking-tight leading-[1.05] max-w-5xl text-white">
          El caos tiene<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">los días contados.</span>
        </h1>

        {/* BAJADA CON TIPOGRAFÍA ELEGANTE ESTILO NEXTCRM (FINA, ESPACIADA Y MODERNA) */}
        <p className="font-light tracking-[0.06em] sm:tracking-[0.1em] text-slate-300 text-xs sm:text-sm md:text-base text-center max-w-2xl mb-8 leading-relaxed uppercase">
          Centraliza mostrador, delivery, mesas, monitor KDS, stock, cierre de caja con desglose de tarjetas e impresión en ticketera preconfigurada.
        </p>

        {/* BOTONES DIRECTOS PARA LAS DOS DEMOS */}
        <div className="flex flex-wrap items-center justify-center gap-3 z-10">
          <button 
            onClick={() => handleLaunchDemo('crm')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 cursor-pointer text-xs sm:text-sm uppercase"
          >
            <Rocket size={16} /> Probar Demo CRM / POS
          </button>

          <button 
            onClick={() => handleLaunchDemo('client_app')}
            className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold tracking-wide px-5 py-3 rounded-2xl flex items-center gap-2 border border-purple-500/40 transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-105 cursor-pointer text-xs sm:text-sm uppercase"
          >
            <Smartphone size={16} /> Probar Demo App Clientes
          </button>

          <button 
            onClick={() => document.getElementById('seccion-voz-ia')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium tracking-wide px-4 py-3 rounded-2xl flex items-center gap-1.5 border border-white/10 transition-all hover:scale-105 cursor-pointer text-xs sm:text-sm"
          >
            Explorar Módulos <ArrowDown size={13} />
          </button>
        </div>
        
        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-voz-ia')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={24} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 2: PEDIDOS POR VOZ & DICTADO DIRECTO (TEMA OSCURO NEXTCRM) */}
      <section id="seccion-voz-ia" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-blue-500/40 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10">
              <Mic size={14} /> Reconocimiento de Voz Multi-Producto
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
              Dicta pedidos<br/><span className="text-blue-400">producto por producto.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
              Dicta al vuelo mientras atiendes el teléfono. Haz pausas naturales entre producto y producto: la IA acumula la comanda automáticamente sin perder los ítems anteriores.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0a0f1c] border border-white/10 p-3.5 rounded-2xl">
                <div className="text-blue-400 mb-1 flex items-center gap-1.5 font-bold text-sm">
                  <Headphones size={16} /> Supresión Acústica
                </div>
                <p className="text-xs text-slate-400">Aísla la voz de ruidos de cocina y horno.</p>
              </div>

              <div className="bg-[#0a0f1c] border border-white/10 p-3.5 rounded-2xl">
                <div className="text-blue-400 mb-1 flex items-center gap-1.5 font-bold text-sm">
                  <MessageSquare size={16} /> WhatsApp Directo
                </div>
                <p className="text-xs text-slate-400">Pega audios o textos de clientes en 1 clic.</p>
              </div>
            </div>

            <p className="text-xs text-blue-400 font-mono">Toca los botones del simulador interactivo →</p>
          </div>

          {/* Floating Voice Simulator Mockup (Dark NextCRM Theme - Tilted De Costado) */}
          <div className="[perspective:1200px] w-full">
            <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.85)] [transform:rotateY(-12deg)_rotateX(6deg)_rotateZ(1.5deg)] transition-all hover:[transform:rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)] flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
                  <span className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">
                    ASISTENTE DE VOZ FLOTANTE
                  </span>
                </div>
                <button
                  onClick={resetVoiceDemo}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                >
                  <RotateCcw size={12} /> Reiniciar
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-mono uppercase block">Prueba agregar ítems con pausas:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => addVoiceDemoChunk('y 2 fainás con queso', 2, 'Fainá con Queso', 'Orilla', 240)}
                    className="bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow"
                  >
                    + Dictar: "2 fainás con queso"
                  </button>
                  <button
                    onClick={() => addVoiceDemoChunk('y 1 coca de litro y medio para delivery', 1, 'Refresco Coca-Cola 1.5L', 'Fría', 180)}
                    className="bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow"
                  >
                    + Dictar: "1 Coca 1.5L"
                  </button>
                </div>
              </div>

              <div className="bg-black border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Mic size={16} className="text-blue-400 animate-pulse shrink-0" />
                  <span className="text-blue-200 italic truncate">"{demoActiveText}"</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">Pausa detectada ✓</span>
              </div>

              <div className="bg-black border border-white/10 p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white border-b border-white/10 pb-2">
                  <span className="flex items-center gap-2"><Sparkles size={15} className="text-blue-400" /> COMANDA ACUMULADA ({demoVoiceItems.length} ÍTEMS)</span>
                  <span className="text-blue-400 font-black text-base font-mono">${totalDemoPrice}</span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-xs sm:text-sm">
                  {demoVoiceItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#070707] px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-slate-200 truncate">
                        <strong className="text-blue-400 font-mono text-sm">{item.qty}x</strong> {item.name} {item.notes && <span className="text-xs text-slate-400">({item.notes})</span>}
                      </span>
                      <span className="font-mono font-bold text-white ml-2">${item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-pos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 3: PUNTO DE VENTA & TICKETTERA (DARK NEXTCRM THEME - TILTED DE COSTADO) */}
      <section id="seccion-pos" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <span className="border border-blue-500/30 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10 inline-block">
              Punto de Venta + Impresión Térmica
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
              Toma pedidos &<br/><span className="text-blue-400">ticketera lista.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
              Compatible con ticketeras térmicas estándar (80mm y 58mm). <strong>Ya viene preconfigurada</strong> para imprimir comandas de cocina y tickets de entrega en 1 clic.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0f1c] border border-white/10 p-4 rounded-2xl">
                <div className="text-blue-400 mb-2"><Printer size={24}/></div>
                <h4 className="font-bold text-base mb-1">Ticketera Térmica</h4>
                <p className="text-xs text-slate-400">80mm / 58mm preconfigurada</p>
              </div>
              <div className="bg-[#0a0f1c] border border-white/10 p-4 rounded-2xl">
                <div className="text-cyan-400 mb-2"><Zap size={24}/></div>
                <h4 className="font-bold text-base mb-1">Mostrador & Salón</h4>
                <p className="text-xs text-slate-400">Manejo de mesas y delivery</p>
              </div>
            </div>
          </div>

          {/* POS & Thermal Ticket Preview (Tilted De Costado) */}
          <div className="[perspective:1200px] w-full">
            <div className="w-full aspect-[16/10] bg-[#0a0f1c] rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] [transform:rotateY(-12deg)_rotateX(6deg)_rotateZ(2deg)] transition-all hover:[transform:rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)] flex flex-col overflow-hidden relative">
              <div className="h-7 bg-[#070c18] flex items-center justify-between px-3 border-b border-white/10 text-[10px] text-slate-400 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  <span className="ml-1.5 font-mono text-slate-400 text-[10px]">pos.pizzeria.app/mostrador</span>
                </div>
                <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-[9px]">POS EN VIVO</span>
              </div>

              <div className="flex-1 p-3 grid grid-cols-3 gap-2.5 bg-black text-left select-none overflow-hidden">
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between bg-[#0a0a0a] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                      <span className="text-slate-300 font-medium">🍕 Catálogo Rápido</span>
                      <span className="text-[10px] text-blue-400 font-bold">12 Productos</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-[#0a0a0a] p-2 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-white">Muzzarella</span>
                          <span className="text-xs font-extrabold text-blue-400">$480</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Porción / Metro</span>
                      </div>
                      <div className="bg-[#0a0a0a] p-2 rounded-xl border border-blue-500/60 ring-1 ring-blue-500/30">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-white">Fugazzeta</span>
                          <span className="text-xs font-extrabold text-blue-400">$540</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Especial cebolla</span>
                      </div>
                      <div className="bg-[#0a0a0a] p-2 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-white">Calabresa</span>
                          <span className="text-xs font-extrabold text-blue-400">$590</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Longaniza picante</span>
                      </div>
                      <div className="bg-[#0a0a0a] p-2 rounded-xl border border-white/10">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-white">Fainá</span>
                          <span className="text-xs font-extrabold text-blue-400">$120</span>
                        </div>
                        <span className="text-[9px] text-slate-400">Orilla / Centro</span>
                      </div>
                    </div>
                  </div>

                  {/* Thermal Receipt Simulation */}
                  <div className="bg-white text-slate-900 rounded-xl p-2.5 flex flex-col justify-between font-mono text-[10px] shadow-lg border border-slate-300">
                    <div>
                      <div className="text-center border-b border-dashed border-slate-400 pb-1 mb-1">
                        <span className="font-black text-[11px] block">PIZZERIA NEXTCRM</span>
                        <span className="text-[8px] text-slate-600 block">TICKET #104 - DELIVERY</span>
                      </div>
                      <div className="space-y-0.5 text-[9px]">
                        <div className="flex justify-between"><span>1x Fugazzeta</span><span>$540</span></div>
                        <div className="flex justify-between"><span>2x Fainá Orilla</span><span>$240</span></div>
                        <div className="text-[8px] text-slate-500">+ Panceta extra</div>
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-400 pt-1">
                      <div className="flex justify-between font-black text-xs">
                        <span>TOTAL:</span>
                        <span>$780</span>
                      </div>
                      <div className="mt-1 bg-blue-600 text-white font-bold text-[8px] py-1 rounded text-center">
                        IMPRESO ✓ (80mm)
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-caja-stock')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 4: CAJA, ARQUEO, TARJETAS Y STOCK (TILTED DE COSTADO) */}
      <section id="seccion-caja-stock" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <span className="border border-blue-500/30 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10 inline-block">
              Control Financiero & Stock
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
              Cierre de caja,<br/><span className="text-blue-400">tarjetas y stock.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
              Arqueo ciego de turnos sin descuadres contables. <strong>Resumen de ventas por tarjeta POS (Visa, Master, Oca, Cabal)</strong>, control de propinas y descuento automático de ingredientes.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0a0f1c] border border-white/10 p-3 rounded-2xl">
                <Wallet size={20} className="text-blue-400 mb-1" />
                <h4 className="font-bold text-xs text-white">Arqueo Ciego</h4>
                <p className="text-[10px] text-slate-400">Cero trampas en caja</p>
              </div>
              <div className="bg-[#0a0f1c] border border-white/10 p-3 rounded-2xl">
                <CreditCard size={20} className="text-cyan-400 mb-1" />
                <h4 className="font-bold text-xs text-white">Desglose POS</h4>
                <p className="text-[10px] text-slate-400">Por sello y franquicia</p>
              </div>
              <div className="bg-[#0a0f1c] border border-white/10 p-3 rounded-2xl">
                <Box size={20} className="text-orange-400 mb-1" />
                <h4 className="font-bold text-xs text-white">Stock Crítico</h4>
                <p className="text-[10px] text-slate-400">Alertas automáticas</p>
              </div>
            </div>
          </div>

          {/* Caja, Tarjetas y Stock Mockup (Tilted De Costado) */}
          <div className="[perspective:1200px] w-full">
            <div className="w-full aspect-[16/10] bg-[#0a0f1c] rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] [transform:rotateY(-12deg)_rotateX(6deg)_rotateZ(2deg)] transition-all hover:[transform:rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)] p-4 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black border border-white/10 rounded-xl p-2.5">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">Ventas Turno</span>
                  <span className="text-base font-black text-white font-mono">$24.850</span>
                </div>
                <div className="bg-black border border-blue-500/40 rounded-xl p-2.5 bg-blue-950/20">
                  <span className="text-[9px] text-blue-400 uppercase font-semibold block">Efectivo Cajón</span>
                  <span className="text-base font-black text-blue-400 font-mono">$14.650</span>
                </div>
                <div className="bg-black border border-purple-500/40 rounded-xl p-2.5 bg-purple-950/20">
                  <span className="text-[9px] text-purple-300 uppercase font-semibold block">Propinas</span>
                  <span className="text-base font-black text-purple-300 font-mono">$1.450</span>
                </div>
              </div>

              {/* Desglose de Tarjetas */}
              <div className="bg-black border border-white/10 rounded-xl p-2.5 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Desglose Tarjetas POS ($10.200)</span>
                  <span className="text-[10px] text-slate-400">Conciliado OK ✓</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-[#0a0a0a] border border-blue-500/30 p-2 rounded-lg">
                    <span className="font-bold text-white block text-[10px]">Visa (Déb/Créd)</span>
                    <span className="text-blue-400 font-black font-mono">$5.400</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-blue-500/30 p-2 rounded-lg">
                    <span className="font-bold text-white block text-[10px]">MasterCard</span>
                    <span className="text-blue-400 font-black font-mono">$3.200</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-blue-500/30 p-2 rounded-lg">
                    <span className="font-bold text-white block text-[10px]">Oca / Cabal</span>
                    <span className="text-blue-400 font-black font-mono">$1.600</span>
                  </div>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="flex items-center justify-between text-xs bg-black px-3 py-2 rounded-xl border border-white/10">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Box size={14} className="text-orange-400" /> Inventario:
                </span>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-blue-400 font-mono">Muzzarella: 18.5kg</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-400 font-mono">Cajas Pizza: 24 u. (Alerta)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-cocina')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 5: COCINA KDS EN ACORDEÓN (TILTED DE COSTADO) */}
      <section id="seccion-cocina" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#050505]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div className="[perspective:1200px] w-full order-2 md:order-1">
            <div className="w-full aspect-[16/10] bg-[#0a0f1c] rounded-2xl border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] [transform:rotateY(10deg)_rotateX(6deg)_rotateZ(-1.5deg)] transition-all hover:[transform:rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)] flex flex-col overflow-hidden relative">
              <div className="h-8 bg-black flex items-center justify-between px-4 border-b border-white/10 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <span className="ml-2 font-mono text-slate-400 hidden sm:inline">cocina.pizzeria.app/kds</span>
                  </div>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20 text-[10px]">KDS ACORDEÓN</span>
              </div>
              <div className="flex-1 p-2.5 grid grid-cols-3 gap-2.5 bg-black text-left select-none overflow-hidden">
                  <div className="bg-[#0a0f1c] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10 text-[11px]">
                        <span className="font-bold text-white">#102 Mesa 2</span>
                        <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded font-bold">12m</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-300">
                        <p className="font-semibold text-white">• 1x Muzzarella</p>
                        <p className="text-slate-400 pl-2">Sin aceitunas</p>
                        <p className="font-semibold text-white">• 2x Fainá</p>
                      </div>
                    </div>
                    <div className="mt-1 bg-blue-600 text-white font-bold text-[9px] py-1 rounded text-center">
                      ✓ LISTO
                    </div>
                  </div>

                  <div className="bg-[#0a0f1c] border border-amber-500/40 rounded-xl p-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10 text-[11px]">
                        <span className="font-bold text-white">#103 Delivery</span>
                        <span className="bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold">22m</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-300">
                        <p className="font-semibold text-white">• 1x Calabresa</p>
                        <p className="font-semibold text-white">• 1x Coca 1.5L</p>
                      </div>
                    </div>
                    <div className="mt-1 bg-amber-600 text-white font-bold text-[9px] py-1 rounded text-center">
                      🔥 EN HORNO
                    </div>
                  </div>

                  <div className="bg-[#0a0507] border border-red-500/60 rounded-xl p-2.5 flex flex-col justify-between ring-1 ring-red-500/30">
                    <div>
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-red-500/30 text-[11px]">
                        <span className="font-bold text-white">#101 Delivery</span>
                        <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded animate-pulse">38m ⚠️</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-200">
                        <p className="font-semibold text-white">• 2x Fugazzeta</p>
                        <p className="text-red-300 font-medium pl-2">Apurar cadete</p>
                      </div>
                    </div>
                    <div className="mt-1 bg-red-600 text-white font-bold text-[9px] py-1 rounded text-center">
                      ⚠️ DEMORADO
                    </div>
                  </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="border border-blue-500/30 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10 inline-block">
              Monitor KDS Acordeón
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
              Cocina organizada<br/><span className="text-blue-400">sin comprimirse.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-8">
              Las comandas no se amontonan ni quedan diminutas. Vista en acordeón con scroll suave por columna y semáforo de demoras.
            </p>
            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-center gap-3 font-bold text-slate-300"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Tarjetas legibles con scroll</li>
              <li className="flex items-center gap-3 font-bold text-slate-300"><div className="w-3 h-3 rounded-full bg-red-500"></div> Alerta visual demora (+30 min)</li>
              <li className="flex items-center gap-3 font-bold text-slate-300"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Columnas independientes</li>
            </ul>
          </div>
        </div>
        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-tech-stack')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 6: STACK TECNOLÓGICO */}
      <section id="seccion-tech-stack" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#050505]">
        <div className="max-w-6xl mx-auto w-full text-center">
          <div className="inline-flex items-center gap-1.5 border border-blue-500/40 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10">
            <Cpu size={14} /> Arquitectura & Stack Tecnológico
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
            Tecnología moderna, <span className="text-blue-400">robusta y ultrarrápida.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-10">
            Construido sobre infraestructura en la nube líder para máxima velocidad, alta concurrencia y cero demoras.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-left">
            <div className="bg-[#0a0f1c] border border-white/10 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-3 border border-white/20 text-white font-black text-base">▲</div>
              <h3 className="font-extrabold text-white text-base">Vercel</h3>
              <span className="text-[10px] text-blue-400 font-mono uppercase font-bold block mb-2">CDN Edge 99.99%</span>
              <p className="text-xs text-slate-400 leading-relaxed">Alojamiento global con máxima velocidad de carga.</p>
            </div>

            <div className="bg-[#0a0f1c] border border-white/10 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3 border border-amber-500/40 text-amber-400 text-base">🔥</div>
              <h3 className="font-extrabold text-white text-base">Firebase</h3>
              <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block mb-2">Firestore Realtime</span>
              <p className="text-xs text-slate-400 leading-relaxed">Sincronización multi-pantalla instantánea.</p>
            </div>

            <div className="bg-[#0a0f1c] border border-white/10 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 border border-blue-500/40 text-blue-400 text-xs font-mono">{'{ }'}</div>
              <h3 className="font-extrabold text-white text-base">JSON</h3>
              <span className="text-[10px] text-blue-400 font-mono uppercase font-bold block mb-2">Datos Portátiles</span>
              <p className="text-xs text-slate-400 leading-relaxed">Estructuración ágil para tickets y backups.</p>
            </div>

            <div className="bg-[#0a0f1c] border border-white/10 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3 border border-purple-500/40 text-purple-400 text-base">⚡</div>
              <h3 className="font-extrabold text-white text-base">Vite</h3>
              <span className="text-[10px] text-purple-400 font-mono uppercase font-bold block mb-2">Build Instantáneo</span>
              <p className="text-xs text-slate-400 leading-relaxed">Compilación ultrarrápida sin bloqueos.</p>
            </div>

            <div className="bg-[#0a0f1c] border border-white/10 p-5 rounded-2xl shadow-lg col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 border border-cyan-500/40 text-cyan-400 text-base">⚛️</div>
              <h3 className="font-extrabold text-white text-base">React</h3>
              <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold block mb-2">UI Táctil Reactiva</span>
              <p className="text-xs text-slate-400 leading-relaxed">Diseñado para pantallas touch, POS y tablets.</p>
            </div>
          </div>
        </div>

        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-webapp')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 6.5: WEB APP CLIENTES & CARTA DIGITAL QR (3D TILTED) */}
      <section id="seccion-webapp" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#03060f]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 border border-purple-500/40 text-purple-400 text-xs font-bold px-3.5 py-1 rounded-full mb-3 tracking-widest uppercase bg-purple-500/10">
              <Globe size={14} /> Módulo 4 • Tu Propia App Web & Menú QR
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight leading-tight">
              Tus clientes piden desde su celular.<br />
              <span className="text-purple-400">Sin comisiones a terceros.</span>
            </h2>
            
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed mb-5 font-normal">
              Bríndale a tus clientes una experiencia de compra premium con tu propio enlace web personalizado (<code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono text-xs">tu-pizzeria.nextcrm.uy</code>) o códigos QR en las mesas.
            </p>

            <div className="space-y-2.5 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                <span><strong>0% Comisiones:</strong> Todo el margen de ganancia queda en tu pizzería.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                <span><strong>Sincronización Total:</strong> Los pedidos web caen directo al POS y a la Cocina KDS.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                <span><strong>Menú QR para Salón:</strong> El comensal escanea, pide y la comanda llega al chef.</span>
              </div>
            </div>

            <button
              onClick={() => { setSubmitted(false); setShowModal(true); }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Smartphone size={16} /> Solicitar Demo con Web App
            </button>
          </div>

          {/* 3D TILTED SMARTPHONE MOCKUP */}
          <div className="[perspective:1200px] w-full flex justify-center">
            <div className="w-full max-w-[320px] aspect-[9/17] bg-[#0c1324] rounded-[2.5rem] border-4 border-slate-700 shadow-[0_30px_70px_rgba(0,0,0,0.9)] [transform:rotateY(-12deg)_rotateX(6deg)_rotateZ(2deg)] transition-all hover:[transform:rotateY(0deg)_rotateX(0deg)_rotateZ(0deg)] flex flex-col overflow-hidden relative text-white">
              
              {/* PHONE TOP NOTCH */}
              <div className="bg-black px-5 py-2 flex justify-between items-center text-[9px] font-mono text-slate-400 shrink-0">
                <span>20:55</span>
                <div className="w-12 h-2.5 bg-slate-800 rounded-full"></div>
                <span>100% 🔋</span>
              </div>

              {/* APP HEADER */}
              <div className="bg-[#101b33] p-3 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h4 className="font-black text-xs text-white uppercase">🍕 Pizzería Gourmet</h4>
                  <p className="text-[9px] text-emerald-400 font-mono">Abierto Ahora • Delivery 30m</p>
                </div>
                <span className="text-[9px] bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                  App Online
                </span>
              </div>

              {/* PRODUCTS LIST */}
              <div className="flex-1 p-2.5 space-y-2 bg-[#090f1c] text-left select-none overflow-hidden">
                <div className="bg-[#121c33] border border-white/10 rounded-xl p-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-white">1 Metro Muzzarella</p>
                    <p className="text-[9px] text-slate-400">+ Jamón y Aceitunas</p>
                    <p className="text-[11px] font-mono font-bold text-emerald-400">$850</p>
                  </div>
                  <span className="bg-purple-600 text-white font-bold text-[9px] px-2 py-1 rounded-lg">+ Pedir</span>
                </div>

                <div className="bg-[#121c33] border border-white/10 rounded-xl p-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-white">2x Fainá con Queso</p>
                    <p className="text-[9px] text-slate-400">Bien doradito</p>
                    <p className="text-[11px] font-mono font-bold text-emerald-400">$210</p>
                  </div>
                  <span className="bg-purple-600 text-white font-bold text-[9px] px-2 py-1 rounded-lg">+ Pedir</span>
                </div>

                <div className="bg-[#121c33] border border-white/10 rounded-xl p-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-white">Coca-Cola 1.5L</p>
                    <p className="text-[9px] text-slate-400">Línea Original Fría</p>
                    <p className="text-[11px] font-mono font-bold text-emerald-400">$150</p>
                  </div>
                  <span className="bg-purple-600 text-white font-bold text-[9px] px-2 py-1 rounded-lg">+ Pedir</span>
                </div>
              </div>

              {/* CART FLOATING FOOTER */}
              <div className="bg-black/95 p-3 border-t border-purple-500/30 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[9px] text-slate-400 block font-mono">3 productos</span>
                  <span className="font-black text-xs text-emerald-400 font-mono">$1.210</span>
                </div>
                <div className="bg-emerald-600 text-white font-black text-[10px] px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  ✓ Confirmar
                </div>
              </div>

            </div>
          </div>
        </div>

        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-precios')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 7: 4 PLANES COMERCIALES (DARK NEXTCRM THEME) */}
      <section id="seccion-precios" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#050505]">
         <div className="text-center mb-4 max-w-4xl mx-auto">
           <div className="inline-flex items-center gap-1.5 border border-blue-500/40 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full mb-1.5 tracking-widest uppercase bg-blue-500/10">
             <DollarSign size={13} /> 4 Módulos & Planes Escalables
           </div>
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">Tu inversión garantizada.</h2>
           <p className="text-slate-400 text-xs mt-0.5">
             Elige el módulo ideal para tu pizzería y desbloquea nuevas funciones cuando lo necesites.
           </p>
         </div>
         
         <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full items-stretch mb-3">
            {/* PLAN 1: BÁSICO */}
            <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-4.5 flex flex-col justify-between shadow-xl">
               <div>
                 <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                     MÓDULO 1
                   </span>
                   <span className="text-[9px] font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                     BÁSICO
                   </span>
                 </div>
                 <h3 className="text-xl font-black text-white">Plan Básico</h3>
                 
                 <div className="my-2.5 pb-2.5 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">$1.490</span>
                      <span className="text-[10px] text-slate-400 uppercase">UYU / mes</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-semibold block mt-0.5">
                      O Compra Definitiva: $190 USD (en hasta 6 cuotas)
                    </span>
                 </div>

                 <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>POS Touch Rápido:</strong> Mostrador & Delivery.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>Impresión Térmica:</strong> Impresora no incluida en el hardware.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>Carga Inicial de Menú:</strong> Por única vez.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>Caja y Clientes:</strong> Arqueo diario de turno.</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-blue-300">
                      <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                      <span><strong>1 Consulta Mensual:</strong> Soporte cubierto.</span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors border border-white/10"
               >
                 Elegir Plan Básico
               </button>
            </div>
            
            {/* PLAN 2: PRO */}
            <div className="bg-[#0e1629] border border-blue-500/50 text-white rounded-3xl p-4.5 flex flex-col justify-between shadow-xl">
               <div>
                 <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[9px] font-mono font-bold text-blue-300 uppercase bg-blue-950 border border-blue-500/40 px-2 py-0.5 rounded-full">
                     MÓDULO 2
                   </span>
                   <span className="text-[9px] font-bold text-blue-300 bg-blue-600/30 px-2 py-0.5 rounded-full">
                     PRO KDS & IA
                   </span>
                 </div>
                 <h3 className="text-xl font-black text-white">Plan Pro</h3>
                 
                 <div className="my-2.5 pb-2.5 border-b border-blue-500/30">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">$2.490</span>
                      <span className="text-[10px] text-blue-300 uppercase">UYU / mes</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-semibold block mt-0.5">
                      O Compra Definitiva: $290 USD (en hasta 6 cuotas)
                    </span>
                 </div>

                 <ul className="space-y-1.5 text-[11px] text-slate-200">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>Todo lo del Plan Básico.</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>Monitor KDS Cocina:</strong> Alertas y demoras.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>WhatsApp & Pedido por Voz:</strong> IA paso a paso.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-blue-400 shrink-0" />
                      <span><strong>Control de Stock:</strong> Insumos críticos.</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-blue-300">
                      <ShieldCheck size={13} className="text-blue-400 shrink-0" />
                      <span><strong>2 Consultas Mensuales:</strong> Soporte directo.</span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all"
               >
                 Elegir Plan Pro
               </button>
            </div>

            {/* PLAN 3: VIP DGI */}
            <div className="bg-[#06140e] border border-emerald-500/50 rounded-3xl p-4.5 flex flex-col justify-between shadow-xl">
               <div>
                 <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[9px] font-mono font-bold text-emerald-300 uppercase bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                     MÓDULO 3
                   </span>
                   <span className="text-[9px] font-bold text-emerald-300 bg-emerald-600/30 px-2 py-0.5 rounded-full">
                     DGI OFICIAL
                   </span>
                 </div>
                 <h3 className="text-xl font-black text-white">Plan VIP DGI</h3>
                 
                 <div className="my-2.5 pb-2.5 border-b border-emerald-500/30">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">$3.490</span>
                      <span className="text-[10px] text-emerald-300 uppercase">UYU / mes</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                      O Compra Definitiva: $390 USD (en hasta 6 cuotas)
                    </span>
                 </div>

                 <ul className="space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span><strong>Todo lo del Plan Pro.</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span><strong>Facturación DGI en Vivo:</strong> e-Tickets / e-Facturas.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span><strong>Partner Facturando.uy:</strong> CAE y QR fiscal.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span><strong>Reportes Avanzados:</strong> Cierres mensuales.</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span><strong>Solicitudes ILIMITADAS:</strong> Soporte VIP.</span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all"
               >
                 Elegir Plan VIP DGI
               </button>
            </div>

            {/* PLAN 4: FULL OMNICANAL + WEB APP */}
            <div className="bg-gradient-to-b from-purple-950/40 to-black border-2 border-purple-500 text-white rounded-3xl p-4.5 flex flex-col justify-between shadow-2xl relative">
               <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg border border-purple-300">
                 ★ Más Completo
               </div>

               <div>
                 <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[9px] font-mono font-bold text-purple-300 uppercase bg-purple-950 border border-purple-500/40 px-2 py-0.5 rounded-full">
                     MÓDULO 4
                   </span>
                   <span className="text-[9px] font-black text-white bg-purple-600 px-2 py-0.5 rounded-full">
                     FULL APP WEB
                   </span>
                 </div>
                 <h3 className="text-xl font-black text-white">Full Omnicanal</h3>
                 
                 <div className="my-2.5 pb-2.5 border-b border-purple-500/30">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white font-mono">$4.490</span>
                      <span className="text-[10px] text-purple-300 uppercase">UYU / mes</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-semibold block mt-0.5">
                      O Compra Definitiva: $490 USD (en hasta 6 cuotas)
                    </span>
                 </div>

                 <ul className="space-y-1.5 text-[11px] text-slate-200">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                      <span><strong>TODO el CRM Full + Facturación DGI.</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                      <span><strong>Tu Propia App Web:</strong> Pedidos desde celular.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                      <span><strong>Menú QR para Mesas:</strong> 0% comisión.</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                      <span><strong>Seguimiento de Envíos en Tiempo Real.</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5 text-purple-300 font-semibold">
                      <CheckCircle2 size={13} className="text-purple-400 shrink-0" />
                      <span><strong>Carga de Menú Bonificada + Soporte VIP.</strong></span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-3 bg-purple-600 hover:bg-purple-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-transform hover:scale-102"
               >
                 Elegir Plan Full
               </button>
            </div>
         </div>

         {/* Compact Support Policy Banner */}
         <div className="max-w-7xl mx-auto bg-[#0a0f1c] border border-blue-500/30 rounded-2xl p-2.5 text-left text-[11px] text-slate-300 flex items-center justify-between gap-3">
           <div className="flex items-center gap-1.5 font-bold text-blue-400 uppercase text-[11px] shrink-0">
             <ShieldCheck size={14} /> Soporte y Garantía Oficial:
           </div>
           <p className="text-slate-300 truncate text-[11px]">
             1 año de garantía ante fallos. Planes Básico (1 consulta/mes), Pro (2 consultas/mes), VIP y Full (Consultas ILIMITADAS y carga bonificada).
           </p>
         </div>
         
         <div 
           className="absolute bottom-4 cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-final')?.scrollIntoView({ behavior: 'smooth' })}
         >
           <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors animate-bounce" />
         </div>
      </section>

      {/* PANTALLA 8: CTA FINAL (DARK NEXTCRM THEME) */}
      <section id="seccion-final" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col items-center justify-center bg-[#050505] text-white px-4 text-center relative border-t border-white/10">
         <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 tracking-tight text-center leading-tight">
            Evoluciona tu pizzería<br/><span className="text-blue-400">hoy.</span>
         </h2>
         <p className="text-sm sm:text-base md:text-lg text-slate-300 mb-8 max-w-xl font-normal">
            Optimiza tus pedidos por voz, comanda de cocina y controla tu negocio en tiempo real.
         </p>
         
         <div className="flex flex-col items-center justify-center gap-3 z-10 w-full max-w-md px-4">
           <button 
             onClick={() => { setSubmitted(false); setError(''); setShowModal(true); }}
             className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full text-base shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer active:scale-95 w-full"
           >
             <MessageSquare size={18} className="text-white"/> Solicitar Demo (24h)
           </button>

           <button 
             onClick={() => setShowDemoAccessModal(true)}
             className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 w-full border border-white/15"
           >
             <Rocket size={16} /> Ingresar a la Demo (Tengo Acceso)
           </button>

           <button 
             onClick={() => setShowClientAccessModal(true)}
             className="bg-blue-950/80 hover:bg-blue-900 text-blue-300 font-semibold px-8 py-3 rounded-full text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md border border-blue-400/30 active:scale-95 w-full"
           >
             <LogIn size={14} className="text-blue-400"/> Acceso Clientes con Licencia
           </button>
         </div>
      </section>

      {/* MODAL ACCESO A LA DEMO */}
      {showDemoAccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => {
                setShowDemoAccessModal(false);
                setDemoAuthError('');
                setDemoAuthSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center justify-center gap-1.5 mb-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Rocket size={22} />
              </div>
              <h3 className="text-xl font-black text-white">Acceso a la Demo</h3>
              <p className="text-xs text-slate-400">Verificación de prueba por 24 horas</p>
            </div>

            {demoAuthSuccess ? (
              <div className="p-5 bg-gradient-to-b from-blue-950/60 to-black border border-blue-500/40 rounded-2xl mb-2 text-center space-y-3.5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
                  <CheckCircle size={24} />
                </div>
                
                <div>
                  <h4 className="text-base font-black text-white uppercase tracking-wider">
                    ¡Bienvenido a NextCRM Pizzería!
                  </h4>
                  <p className="text-xs text-blue-300 font-medium mt-1">
                    {verifiedAccountData?.clienteNombre || demoAuthInput}
                    {verifiedAccountData?.negocioNombre ? ` • ${verifiedAccountData.negocioNombre}` : ''}
                  </p>
                </div>

                <div className="bg-black/60 border border-white/10 p-3 rounded-xl text-left text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duración Activa:</span>
                    <span className="text-emerald-400 font-bold">24 Horas Habilitadas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Módulos Incluidos:</span>
                    <span className="text-blue-400 font-bold">POS, WhatsApp, KDS, DGI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soporte y Asistencia:</span>
                    <span className="text-white">098 356 320</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDemoAccessModal(false);
                      onStartDemo('crm');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Rocket size={15} /> Ingresar a Demo CRM / POS
                  </button>

                  {(verifiedAccountData?.plan === 'plan_full' || verifiedAccountData?.isAdmin || !verifiedAccountData?.plan) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDemoAccessModal(false);
                        onStartDemo('client_app');
                      }}
                      className="w-full bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider border border-purple-500/40 shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Smartphone size={15} /> Ingresar a Demo App Clientes
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowDemoAccessModal(false);
                        setShowPlan4RequiredModal(true);
                      }}
                      className="w-full bg-black/50 hover:bg-purple-950/60 text-slate-400 hover:text-purple-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider border border-white/10 shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Lock size={14} className="text-amber-400" /> App Clientes (Requiere Plan Full)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyDemo} className="space-y-3 mb-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail size={13} className="text-blue-400" /> Correo o Usuario:
                  </label>
                  <input
                    type="text"
                    required
                    value={demoAuthInput}
                    onChange={(e) => {
                      setDemoAuthInput(e.target.value);
                      setDemoAuthError('');
                    }}
                    placeholder="tu-correo@gmail.com"
                    className="w-full bg-black border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-blue-400" /> Contraseña (si aplica):
                  </label>
                  <input
                    type="password"
                    value={demoPasswordInput}
                    onChange={(e) => {
                      setDemoPasswordInput(e.target.value);
                      setDemoAuthError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-black border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
                  />
                </div>

                {demoAuthError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-1.5 text-red-400 text-xs leading-tight">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{demoAuthError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingDemo}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Rocket size={16} /> {isVerifyingDemo ? 'Verificando...' : 'Entrar a la Demo'}
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowDemoAccessModal(false);
                  setSubmitted(false);
                  setError('');
                  setShowModal(true);
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors underline cursor-pointer"
              >
                Solicitar Acceso Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACCESO CLIENTES */}
      {showClientAccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => setShowClientAccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center justify-center gap-1.5 mb-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-xl font-black text-white">Acceso a tu CRM</h3>
              <p className="text-xs text-slate-400">Portal exclusivo para clientes con licencia</p>
            </div>

            <div className="bg-black p-3.5 rounded-xl border border-white/10 text-left mb-4 space-y-2.5">
              <p className="text-xs text-slate-300">
                Ingresa el nombre o enlace asignado a tu pizzería:
              </p>
              
              <form onSubmit={handleClientRedirect} className="space-y-2">
                <input
                  type="text"
                  value={clientUrlInput}
                  onChange={(e) => setClientUrlInput(e.target.value)}
                  placeholder="Ej: napoli o mi-pizzeria.vercel.app"
                  className="w-full bg-[#050505] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!clientUrlInput.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 cursor-pointer"
                >
                  <ExternalLink size={14} /> Ir a mi CRM Privado
                </button>
              </form>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=59898356320&text=Hola,%20olvidé%20el%20enlace%20de%20acceso%20a%20mi%20CRM"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-blue-400 underline"
            >
              ¿Olvidaste tu enlace? Solicítalo por WhatsApp (098 356 320)
            </a>
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR DEMO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            {!submitted ? (
              <>
                <div className="flex flex-col items-center justify-center gap-1.5 mb-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Solicitar Acceso a la Demo</h3>
                    <p className="text-xs text-slate-400">Acceso exclusivo por 24 horas</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs py-1.5 px-3 rounded-xl mb-3 font-medium text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 text-center">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-center gap-1 text-center">
                      <Mail size={13} className="text-blue-400" /> Correo Electrónico <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors text-center"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-center gap-1 text-center">
                      <Building size={13} className="text-blue-400" /> Pizzería / Negocio
                    </label>
                    <input
                      type="text"
                      value={negocio}
                      onChange={(e) => setNegocio(e.target.value)}
                      placeholder="Ej. Pizzería Napoli"
                      className="w-full bg-black border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    <Send size={14} /> {isSubmitting ? 'Enviando...' : 'Solicitar Acceso 24hs'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-2 space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">¡Solicitud Registrada!</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Te activaremos el acceso exclusivo por <strong className="text-white">24 horas</strong> para <strong className="text-blue-400">{email}</strong>.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=59898356320&text=${encodeURIComponent(`Hola, acabo de solicitar acceso demo para el correo: ${email}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <MessageSquare size={14} /> Abrir WhatsApp con mi Solicitud (098 356 320)
                  </a>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-white/10 hover:bg-white/20 text-slate-300 font-semibold py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PLAN 4 REQUERIDO PARA APP CLIENTES */}
      {showPlan4RequiredModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0f1c] border border-purple-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => setShowPlan4RequiredModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
              <Smartphone size={24} />
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">
              Módulo 4: App Web de Clientes
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Tu prueba demo actual corresponde al CRM (Planes 1, 2 o 3). La aplicación web de clientes para pedidos directos sin comisión requiere habilitación del <strong>Plan 4 Full Omnicanal</strong>.
            </p>

            <div className="bg-black/60 border border-white/10 p-3.5 rounded-2xl text-left text-xs text-slate-300 space-y-2 mb-4">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Sparkles size={14} /> ¿Qué incluye la App Web de Clientes?
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 pl-4 list-disc">
                <li>Catálogo digital propio sin comisiones a terceros</li>
                <li>Geolocalización GPS automática para envíos</li>
                <li>Seguimiento de pedidos en tiempo real</li>
                <li>Menú QR para mesas en salón</li>
              </ul>
            </div>

            <div className="space-y-2">
              <a
                href="https://api.whatsapp.com/send?phone=59898356320&text=Hola%20JPZ,%20quiero%20solicitar%20la%20prueba%20o%20cotización%20del%20Módulo%204%20(Plan%20Full%20Omnicanal%20con%20App%20Clientes)."
                target="_blank"
                rel="noreferrer"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare size={15} /> Solicitar Demo Plan 4 por WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  setShowPlan4RequiredModal(false);
                  onStartDemo('crm');
                }}
                className="w-full bg-white/10 hover:bg-white/15 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Continuar a la Demo CRM / POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
