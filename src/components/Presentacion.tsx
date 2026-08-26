import React, { useState } from 'react';
import { 
  ArrowDown, ChevronsDown, Pointer, Zap, Wallet, Heart, Download, 
  Package, Users, MessageSquare, CheckCircle, Info, Rocket, X, Mail, User, Building, Send, Clock, Sparkles, LogIn, ExternalLink, ShieldCheck, KeyRound, Copy, Check, Lock, AlertCircle,
  Mic, Cpu, Layers, Database, Globe, Code2, Headphones, HelpCircle, Flame, CheckCircle2, ChevronRight, DollarSign, RotateCcw, CreditCard, Printer, FileText, BarChart3, Receipt, Box
} from 'lucide-react';
import { saveDemoRequest, verifyDemoAccess, getLocalDemoSession } from '../lib/firebase';

interface PresentacionProps {
  onStartDemo: () => void;
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
        setTimeout(() => {
          setShowDemoAccessModal(false);
          onStartDemo();
        }, 800);
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
    <div className="h-screen w-full bg-[#0a0f1c] text-white font-sans overflow-x-hidden overflow-y-auto snap-y snap-mandatory selection:bg-emerald-500 selection:text-white scroll-smooth relative">
      {/* BARRA SUPERIOR FIJA / HEADER */}
      <header className="fixed top-0 left-0 w-full z-40 px-4 sm:px-8 py-3 flex items-center justify-between bg-[#0a0f1c]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20 text-sm">
            🍕
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">NextCRM <span className="text-emerald-400 font-bold">Pizzerías</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDemoAccessModal(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 cursor-pointer"
          >
            <Rocket size={14} className="stroke-[2.5]" /> Acceso a Demo
          </button>

          <button
            onClick={() => setShowClientAccessModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-full border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogIn size={14} /> Acceso Clientes
          </button>
        </div>
      </header>

      {/* PANTALLA 1: HERO */}
      <section id="seccion-hero" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col items-center justify-center relative px-4 text-center">
        <div className="inline-flex items-center gap-2 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase bg-emerald-500/10 backdrop-blur-sm">
          <Sparkles size={13} className="text-emerald-400" /> Software Gastronómico Premium + Pedidos por Voz con IA
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-center mb-4 tracking-tight leading-tight max-w-4xl text-white">
          El caos operativo tiene<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-400">los días contados.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 text-center max-w-2xl mb-8 leading-relaxed font-normal">
          Centraliza mostrador, delivery, mesas, monitor KDS, stock, cierre de caja con desglose de tarjetas e impresión en ticketera preconfigurada.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 z-10">
          <button 
            onClick={() => document.getElementById('seccion-voz-ia')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-full flex items-center gap-2.5 transition-all shadow-lg hover:scale-105 cursor-pointer text-sm"
          >
            <Mic size={16} /> Ver Pedidos por Voz <ArrowDown size={15} />
          </button>

          <button 
            onClick={() => document.getElementById('seccion-pos')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-full flex items-center gap-2 border border-slate-700 transition-all hover:scale-105 cursor-pointer text-sm"
          >
            Explorar Módulos
          </button>
        </div>
        
        <div 
           className="absolute bottom-5 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-voz-ia')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={24} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 2: PEDIDOS POR VOZ & DICTADO DIRECTO */}
      <section id="seccion-voz-ia" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-gradient-to-b from-[#0a0f1c] via-[#061510] to-[#0a0f1c]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-emerald-500/10">
              <Mic size={14} /> Reconocimiento de Voz Multi-Producto
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Dicta pedidos<br/><span className="text-emerald-400">producto por producto.</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
              Dicta al vuelo mientras atiendes el teléfono. Haz pausas naturales entre producto y producto: la IA acumula la comanda automáticamente sin perder los ítems anteriores.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0b1b15] border border-emerald-500/30 p-3.5 rounded-2xl">
                <div className="text-emerald-400 mb-1 flex items-center gap-1.5 font-bold text-sm">
                  <Headphones size={16} /> Supresión Acústica
                </div>
                <p className="text-xs text-slate-400">Aísla la voz de ruidos de cocina y horno.</p>
              </div>

              <div className="bg-[#0b1b15] border border-emerald-500/30 p-3.5 rounded-2xl">
                <div className="text-emerald-400 mb-1 flex items-center gap-1.5 font-bold text-sm">
                  <MessageSquare size={16} /> WhatsApp Directo
                </div>
                <p className="text-xs text-slate-400">Pega audios o textos de clientes en 1 clic.</p>
              </div>
            </div>

            <p className="text-xs text-emerald-400 font-mono">Toca los botones del simulador interactivo →</p>
          </div>

          {/* Floating Voice Simulator Mockup */}
          <div className="bg-[#040e0a] border border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
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
                  className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow"
                >
                  + Dictar: "2 fainás con queso"
                </button>
                <button
                  onClick={() => addVoiceDemoChunk('y 1 coca de litro y medio para delivery', 1, 'Refresco Coca-Cola 1.5L', 'Fría', 180)}
                  className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow"
                >
                  + Dictar: "1 Coca 1.5L"
                </button>
              </div>
            </div>

            <div className="bg-black/60 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 truncate">
                <Mic size={16} className="text-emerald-400 animate-pulse shrink-0" />
                <span className="text-emerald-200 italic truncate">"{demoActiveText}"</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">Pausa detectada ✓</span>
            </div>

            <div className="bg-[#061711] border border-emerald-500/40 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-300 border-b border-emerald-500/20 pb-2">
                <span className="flex items-center gap-2"><Sparkles size={15} className="text-emerald-400" /> COMANDA ACUMULADA ({demoVoiceItems.length} ÍTEMS)</span>
                <span className="text-emerald-400 font-black text-base font-mono">${totalDemoPrice}</span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-xs sm:text-sm">
                {demoVoiceItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-xl border border-emerald-500/10">
                    <span className="text-slate-200 truncate">
                      <strong className="text-emerald-400 font-mono text-sm">{item.qty}x</strong> {item.name} {item.notes && <span className="text-xs text-emerald-400/90">({item.notes})</span>}
                    </span>
                    <span className="font-mono font-bold text-emerald-300 ml-2">${item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div 
           className="absolute bottom-6 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-pos')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={30} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 3: PUNTO DE VENTA & TICKETTERA TÉRMICA */}
      <section id="seccion-pos" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <span className="border border-green-500/30 text-green-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-green-500/10 inline-block">
              Punto de Venta + Impresión Térmica
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Toma pedidos &<br/><span className="text-green-400">ticketera lista.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
              Compatible con ticketeras térmicas estándar (80mm y 58mm). <strong>Ya viene preconfigurada</strong> para imprimir comandas de cocina y tickets fiscales o de entrega en 1 clic.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl">
                <div className="text-emerald-400 mb-2"><Printer size={24}/></div>
                <h4 className="font-bold text-base mb-1">Ticketera Térmica</h4>
                <p className="text-xs text-slate-500">80mm / 58mm preconfigurada</p>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-4 rounded-2xl">
                <div className="text-blue-400 mb-2"><Zap size={24}/></div>
                <h4 className="font-bold text-base mb-1">Mostrador & Salón</h4>
                <p className="text-xs text-slate-500">Manejo de mesas y delivery</p>
              </div>
            </div>
          </div>

          {/* POS & Thermal Ticket Preview */}
          <div className="w-full aspect-[16/10] bg-[#0d1322] rounded-2xl border border-slate-700/60 shadow-2xl flex overflow-hidden relative">
            <div className="flex-1 p-3 grid grid-cols-3 gap-2.5 bg-[#090d16] text-left select-none">
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between bg-[#111827] px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">🍕 Catálogo Rápido</span>
                    <span className="text-[10px] text-emerald-400 font-bold">12 Productos</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="bg-[#151f32] p-2 rounded-xl border border-slate-700/50">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-white">Muzzarella</span>
                        <span className="text-xs font-extrabold text-emerald-400">$480</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Porción / Metro</span>
                    </div>
                    <div className="bg-[#151f32] p-2 rounded-xl border border-emerald-500/60 ring-1 ring-emerald-500/30">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-white">Fugazzeta</span>
                        <span className="text-xs font-extrabold text-emerald-400">$540</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Especial cebolla</span>
                    </div>
                    <div className="bg-[#151f32] p-2 rounded-xl border border-slate-700/50">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-white">Calabresa</span>
                        <span className="text-xs font-extrabold text-emerald-400">$590</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Longaniza picante</span>
                    </div>
                    <div className="bg-[#151f32] p-2 rounded-xl border border-slate-700/50">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-white">Fainá</span>
                        <span className="text-xs font-extrabold text-emerald-400">$120</span>
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
                    <div className="mt-1 bg-emerald-600 text-white font-bold text-[8px] py-1 rounded text-center">
                      IMPRESO ✓ (80mm)
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
        <div 
           className="absolute bottom-6 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-caja-stock')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={30} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 4: CAJA, ARQUEO, TARJETAS Y STOCK */}
      <section id="seccion-caja-stock" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#090d18]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div>
            <span className="border border-blue-500/30 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10 inline-block">
              Control Financiero & Stock
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Cierre de caja,<br/><span className="text-blue-400">tarjetas y stock.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
              Arqueo ciego de turnos sin descuadres contables. <strong>Resumen de ventas por tarjeta POS (Visa, Master, Oca, Cabal)</strong>, control de propinas y descuento automático de ingredientes.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#111827] border border-slate-800 p-3 rounded-2xl">
                <Wallet size={20} className="text-emerald-400 mb-1" />
                <h4 className="font-bold text-xs text-white">Arqueo Ciego</h4>
                <p className="text-[10px] text-slate-500">Cero trampas en caja</p>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-3 rounded-2xl">
                <CreditCard size={20} className="text-blue-400 mb-1" />
                <h4 className="font-bold text-xs text-white">Desglose POS</h4>
                <p className="text-[10px] text-slate-500">Por sello y franquicia</p>
              </div>
              <div className="bg-[#111827] border border-slate-800 p-3 rounded-2xl">
                <Box size={20} className="text-orange-400 mb-1" />
                <h4 className="font-bold text-xs text-white">Stock Crítico</h4>
                <p className="text-[10px] text-slate-500">Alertas automáticas</p>
              </div>
            </div>
          </div>

          {/* Caja, Tarjetas y Stock Mockup */}
          <div className="w-full aspect-[16/10] bg-[#0d1322] rounded-2xl border border-slate-700/60 shadow-2xl p-4 flex flex-col justify-between">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-2.5">
                <span className="text-[9px] text-slate-400 uppercase font-semibold block">Ventas Turno</span>
                <span className="text-base font-black text-white font-mono">$24.850</span>
              </div>
              <div className="bg-[#111827] border border-emerald-500/30 rounded-xl p-2.5 bg-emerald-500/5">
                <span className="text-[9px] text-emerald-400 uppercase font-semibold block">Efectivo Cajón</span>
                <span className="text-base font-black text-emerald-400 font-mono">$14.650</span>
              </div>
              <div className="bg-[#111827] border border-purple-500/30 rounded-xl p-2.5 bg-purple-500/5">
                <span className="text-[9px] text-purple-300 uppercase font-semibold block">Propinas</span>
                <span className="text-base font-black text-purple-300 font-mono">$1.450</span>
              </div>
            </div>

            {/* Desglose de Tarjetas */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-400 uppercase tracking-wider">Desglose Tarjetas POS ($10.200)</span>
                <span className="text-[10px] text-slate-400">Conciliado OK ✓</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-[#0b1329] border border-blue-500/30 p-2 rounded-lg">
                  <span className="font-bold text-white block text-[10px]">Visa (Déb/Créd)</span>
                  <span className="text-blue-400 font-black font-mono">$5.400</span>
                </div>
                <div className="bg-[#0b1329] border border-blue-500/30 p-2 rounded-lg">
                  <span className="font-bold text-white block text-[10px]">MasterCard</span>
                  <span className="text-blue-400 font-black font-mono">$3.200</span>
                </div>
                <div className="bg-[#0b1329] border border-blue-500/30 p-2 rounded-lg">
                  <span className="font-bold text-white block text-[10px]">Oca / Cabal</span>
                  <span className="text-blue-400 font-black font-mono">$1.600</span>
                </div>
              </div>
            </div>

            {/* Stock Bar */}
            <div className="flex items-center justify-between text-xs bg-[#111827] px-3 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Box size={14} className="text-orange-400" /> Inventario:
              </span>
              <div className="flex gap-3 text-[11px]">
                <span className="text-emerald-400 font-mono">Muzzarella: 18.5kg</span>
                <span className="text-slate-400">|</span>
                <span className="text-amber-400 font-mono">Cajas Pizza: 24 u. (Alerta)</span>
              </div>
            </div>
          </div>
        </div>
        <div 
           className="absolute bottom-6 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-cocina')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={30} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 5: COCINA KDS EN ACORDEÓN */}
      <section id="seccion-cocina" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center w-full">
          <div className="w-full aspect-[16/10] bg-[#0d1322] rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col overflow-hidden relative order-2 md:order-1">
            <div className="h-8 bg-[#1e293b] flex items-center justify-between px-4 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="ml-2 font-mono text-slate-500 hidden sm:inline">cocina.pizzeria.app/kds</span>
                </div>
                <span className="text-red-400 font-bold bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20 text-[10px]">KDS ACORDEÓN</span>
            </div>
            <div className="flex-1 p-2.5 grid grid-cols-3 gap-2.5 bg-[#080c14] text-left select-none overflow-hidden">
                <div className="bg-[#111827] border border-emerald-500/40 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800 text-[11px]">
                      <span className="font-bold text-white">#102 Mesa 2</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold">12m</span>
                    </div>
                    <div className="space-y-1 text-[10px] text-slate-300">
                      <p className="font-semibold text-white">• 1x Muzzarella</p>
                      <p className="text-slate-400 pl-2">Sin aceitunas</p>
                      <p className="font-semibold text-white">• 2x Fainá</p>
                    </div>
                  </div>
                  <div className="mt-1 bg-emerald-600 text-white font-bold text-[9px] py-1 rounded text-center">
                    ✓ LISTO
                  </div>
                </div>

                <div className="bg-[#111827] border border-amber-500/40 rounded-xl p-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-800 text-[11px]">
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

                <div className="bg-[#1e131d] border border-red-500/60 rounded-xl p-2.5 flex flex-col justify-between ring-1 ring-red-500/30">
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

          <div className="order-1 md:order-2">
            <span className="border border-red-500/30 text-red-400 text-xs font-bold px-3.5 py-1 rounded-full mb-4 tracking-widest uppercase bg-red-500/10 inline-block">
              Monitor KDS Acordeón
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Cocina organizada<br/><span className="text-red-400">sin comprimirse.</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed mb-8">
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
           className="absolute bottom-6 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-tech-stack')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={30} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 6: STACK TECNOLÓGICO */}
      <section id="seccion-tech-stack" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#090e1a]">
        <div className="max-w-6xl mx-auto w-full text-center">
          <div className="inline-flex items-center gap-1.5 border border-blue-500/40 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase bg-blue-500/10">
            <Cpu size={14} /> Arquitectura & Stack Tecnológico
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-3">
            Tecnología moderna, <span className="text-blue-400">robusta y ultrarrápida.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-10">
            Construido sobre infraestructura en la nube líder para máxima velocidad, alta concurrencia y cero demoras.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-left">
            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-3 border border-white/20 text-white font-black text-base">▲</div>
              <h3 className="font-extrabold text-white text-base">Vercel</h3>
              <span className="text-[10px] text-blue-400 font-mono uppercase font-bold block mb-2">CDN Edge 99.99%</span>
              <p className="text-xs text-slate-400 leading-relaxed">Alojamiento global con máxima velocidad de carga.</p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3 border border-amber-500/40 text-amber-400 text-base">🔥</div>
              <h3 className="font-extrabold text-white text-base">Firebase</h3>
              <span className="text-[10px] text-amber-400 font-mono uppercase font-bold block mb-2">Firestore Realtime</span>
              <p className="text-xs text-slate-400 leading-relaxed">Sincronización multi-pantalla instantánea.</p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 border border-emerald-500/40 text-emerald-400 text-xs font-mono">{'{ }'}</div>
              <h3 className="font-extrabold text-white text-base">JSON</h3>
              <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold block mb-2">Datos Portátiles</span>
              <p className="text-xs text-slate-400 leading-relaxed">Estructuración ágil para tickets y backups.</p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3 border border-purple-500/40 text-purple-400 text-base">⚡</div>
              <h3 className="font-extrabold text-white text-base">Vite</h3>
              <span className="text-[10px] text-purple-400 font-mono uppercase font-bold block mb-2">Build Instantáneo</span>
              <p className="text-xs text-slate-400 leading-relaxed">Compilación ultrarrápida sin bloqueos.</p>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl shadow-lg col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 border border-cyan-500/40 text-cyan-400 text-base">⚛️</div>
              <h3 className="font-extrabold text-white text-base">React</h3>
              <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold block mb-2">UI Táctil Reactiva</span>
              <p className="text-xs text-slate-400 leading-relaxed">Diseñado para pantallas touch, POS y tablets.</p>
            </div>
          </div>
        </div>

        <div 
           className="absolute bottom-6 animate-bounce cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-precios')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronsDown size={30} className="text-slate-600 hover:text-slate-400 transition-colors" />
        </div>
      </section>

      {/* PANTALLA 7: 3 PLANES CÓMODOS Y ESPACIOSOS */}
      <section id="seccion-precios" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col justify-center relative px-4 md:px-8 bg-[#080d1a]">
         <div className="text-center mb-5 max-w-4xl mx-auto">
           <div className="inline-flex items-center gap-1.5 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3.5 py-1 rounded-full mb-2 tracking-widest uppercase bg-emerald-500/10">
             <DollarSign size={13} /> 3 Planes Transparentes & Razonables
           </div>
           <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">Tu inversión garantizada.</h2>
           <p className="text-slate-400 text-xs sm:text-sm mt-1">
             Opciones con y sin mantenimiento mensual, con 1 año de soporte técnico ante fallos de plataforma.
           </p>
         </div>
         
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 w-full items-stretch mb-4">
            {/* PLAN 1: BÁSICO */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-xl">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-slate-800 px-2.5 py-1 rounded-full">
                     AUTOGESTIONABLE
                   </span>
                   <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                     <CreditCard size={11} /> 6 cuotas
                   </span>
                 </div>
                 <h3 className="text-2xl font-black text-white">Plan Básico</h3>
                 
                 <div className="my-3 pb-3 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">$190</span>
                      <span className="text-xs text-slate-400 uppercase">USD / Pago Único</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
                      O en hasta 6 cuotas de ~$32 USD (~$1.580 UYU)
                    </span>
                 </div>

                 <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>Software Completo:</strong> POS, KDS Cocina, Mesas, Delivery, Stock y Caja.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>Ticketera Térmica:</strong> Preconfigurada para 80mm y 58mm.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>Carga Autogestionable:</strong> El cliente carga sus productos y precios.</span>
                    </li>
                    <li className="flex items-center gap-2 text-blue-300">
                      <ShieldCheck size={14} className="text-blue-400 shrink-0" />
                      <span><strong>1 año de soporte:</strong> 1 consulta técnica mensual incluida.</span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
               >
                 Elegir Plan Básico
               </button>
            </div>
            
            {/* PLAN 2: INTERMEDIO */}
            <div className="bg-[#13221b] border-2 border-emerald-500 text-white rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-2xl relative z-10">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase bg-emerald-950 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                     CON MANTENIMIENTO
                   </span>
                   <span className="text-[10px] font-black text-slate-950 bg-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                     <Flame size={11} className="fill-slate-950" /> RECOMENDADO
                   </span>
                 </div>
                 <h3 className="text-2xl font-black text-white">Plan Intermedio</h3>
                 
                 <div className="my-3 pb-3 border-b border-emerald-500/30">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">$35</span>
                      <span className="text-xs text-emerald-300 uppercase">USD / Mes</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
                      Equivalente a ~$1.490 UYU / mes
                    </span>
                 </div>

                 <ul className="space-y-2 text-xs text-slate-200">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>Todo lo del Plan Básico + Ticketera preconfigurada.</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>Copias de Seguridad:</strong> Respaldo periódico y seguridad.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>Carga de Menú & Precios:</strong> Modificaciones por nuestro equipo.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span><strong>2 Consultas Mensuales Incluidas:</strong> Soporte prioritario directo.</span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-transform hover:scale-102"
               >
                 Elegir Plan Intermedio
               </button>
            </div>

            {/* PLAN 3: PREMIUM IA FULL */}
            <div className="bg-[#111827] border border-cyan-500/50 rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-xl">
               <div>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase bg-cyan-950 border border-cyan-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                     <Sparkles size={11} className="text-cyan-400" /> FULL IA & VOZ
                   </span>
                 </div>
                 <h3 className="text-2xl font-black text-white">Plan Premium IA</h3>
                 
                 <div className="my-3 pb-3 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">$55</span>
                      <span className="text-xs text-cyan-300 uppercase">USD / Mes</span>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold block mt-0.5">
                      Equivalente a ~$2.290 UYU / mes
                    </span>
                 </div>

                 <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                      <span><strong>Todo lo del Plan Intermedio + Mantenimiento total.</strong></span>
                    </li>
                    <li className="flex items-center gap-2 text-cyan-200">
                      <Mic size={14} className="text-cyan-400 shrink-0" />
                      <span><strong>Pedidos por Voz con IA:</strong> Dictado directo por producto.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                      <span><strong>Conversión de WhatsApp:</strong> Comprensión automática de mensajes.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-cyan-400 shrink-0" />
                      <span><strong>2 Consultas Mensuales + Soporte VIP:</strong> Asistencia preferencial.</span>
                    </li>
                 </ul>
               </div>

               <button
                 onClick={() => { setSubmitted(false); setShowModal(true); }}
                 className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
               >
                 Elegir Plan Premium IA
               </button>
            </div>
         </div>

         {/* Compact Support Policy Banner */}
         <div className="max-w-6xl mx-auto bg-[#0d1629] border border-blue-500/30 rounded-2xl p-3 text-left text-xs text-slate-300 flex items-center justify-between gap-4">
           <div className="flex items-center gap-2 font-bold text-blue-400 uppercase text-xs shrink-0">
             <ShieldCheck size={16} /> Soporte y Garantía:
           </div>
           <p className="text-slate-300 truncate">
             1 año de soporte técnico cubierto ante fallos. Plan Básico incluye 1 consulta mensual al año; Planes mensuales incluyen carga de carta y 2 consultas al mes.
           </p>
         </div>
         
         <div 
           className="absolute bottom-4 cursor-pointer flex justify-center w-full z-10"
           onClick={() => document.getElementById('seccion-final')?.scrollIntoView({ behavior: 'smooth' })}
         >
           <ChevronsDown size={28} className="text-slate-600 hover:text-slate-400 transition-colors animate-bounce" />
         </div>
      </section>

      {/* PANTALLA 8: CTA FINAL */}
      <section id="seccion-final" className="w-full h-screen max-h-screen overflow-hidden snap-start snap-always flex flex-col items-center justify-center bg-[#159a49] text-white px-4 text-center relative">
         <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-3 tracking-tight text-center leading-tight">
            Evoluciona tu pizzería hoy.
         </h2>
         <p className="text-base sm:text-lg md:text-xl text-white/90 mb-7 max-w-lg font-normal">
            Optimiza tus pedidos por voz, comanda de cocina y controla tu negocio en tiempo real.
         </p>
         
         <div className="flex flex-col items-center justify-center gap-3 z-10 w-full max-w-md px-4">
           <button 
             onClick={() => { setSubmitted(false); setError(''); setShowModal(true); }}
             className="bg-[#0a0f1c] hover:bg-[#1a2333] text-white font-bold px-8 py-4 rounded-full text-lg shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20 active:scale-95 w-full"
           >
             <MessageSquare size={20} className="text-emerald-400"/> Solicitar Demo (24h)
           </button>

           <button 
             onClick={() => setShowDemoAccessModal(true)}
             className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-full text-sm sm:text-base shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 w-full"
           >
             <Rocket size={18} /> Ingresar a la Demo (Tengo Acceso)
           </button>

           <button 
             onClick={() => setShowClientAccessModal(true)}
             className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 font-semibold px-8 py-3 rounded-full text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md border border-emerald-400/30 active:scale-95 w-full"
           >
             <LogIn size={15} className="text-emerald-400"/> Acceso Clientes con Licencia
           </button>
         </div>
      </section>

      {/* MODAL ACCESO A LA DEMO */}
      {showDemoAccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => {
                setShowDemoAccessModal(false);
                setDemoAuthError('');
                setDemoAuthSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center justify-center gap-1.5 mb-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Rocket size={22} />
              </div>
              <h3 className="text-xl font-black text-white">Acceso a la Demo</h3>
              <p className="text-xs text-slate-400">Verificación de prueba por 24 horas</p>
            </div>

            {demoAuthSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle size={16} />
                  <span>{demoAuthSuccess}</span>
                </div>
                <p className="text-xs text-slate-300">Cargando el sistema...</p>
              </div>
            ) : (
              <form onSubmit={handleVerifyDemo} className="space-y-3 mb-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail size={13} className="text-emerald-400" /> Correo o Usuario:
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
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-emerald-400" /> Contraseña (si aplica):
                  </label>
                  <input
                    type="password"
                    value={demoPasswordInput}
                    onChange={(e) => {
                      setDemoPasswordInput(e.target.value);
                      setDemoAuthError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
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
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Rocket size={16} /> {isVerifyingDemo ? 'Verificando...' : 'Entrar a la Demo'}
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowDemoAccessModal(false);
                  setSubmitted(false);
                  setError('');
                  setShowModal(true);
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors underline cursor-pointer"
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
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => setShowClientAccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center justify-center gap-1.5 mb-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-xl font-black text-white">Acceso a tu CRM</h3>
              <p className="text-xs text-slate-400">Portal exclusivo para clientes con licencia</p>
            </div>

            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 text-left mb-4 space-y-2.5">
              <p className="text-xs text-slate-300">
                Ingresa el nombre o enlace asignado a tu pizzería:
              </p>
              
              <form onSubmit={handleClientRedirect} className="space-y-2">
                <input
                  type="text"
                  value={clientUrlInput}
                  onChange={(e) => setClientUrlInput(e.target.value)}
                  placeholder="Ej: napoli o mi-pizzeria.vercel.app"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!clientUrlInput.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs disabled:opacity-40 cursor-pointer"
                >
                  <ExternalLink size={14} /> Ir a mi CRM Privado
                </button>
              </form>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=59898356320&text=Hola,%20olvidé%20el%20enlace%20de%20acceso%20a%20mi%20CRM"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-emerald-400 underline"
            >
              ¿Olvidaste tu enlace? Solicítalo por WhatsApp (098 356 320)
            </a>
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR DEMO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            {!submitted ? (
              <>
                <div className="flex flex-col items-center justify-center gap-1.5 mb-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
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
                      <Mail size={13} className="text-emerald-400" /> Correo Electrónico <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-correo@ejemplo.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors text-center"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-1 flex items-center justify-center gap-1 text-center">
                      <Building size={13} className="text-emerald-400" /> Pizzería / Negocio
                    </label>
                    <input
                      type="text"
                      value={negocio}
                      onChange={(e) => setNegocio(e.target.value)}
                      placeholder="Ej. Pizzería Napoli"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    <Send size={14} /> {isSubmitting ? 'Enviando...' : 'Solicitar Acceso 24hs'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-2 space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">¡Solicitud Registrada!</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Te activaremos el acceso exclusivo por <strong className="text-white">24 horas</strong> para <strong className="text-emerald-400">{email}</strong>.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=59898356320&text=${encodeURIComponent(`Hola, acabo de solicitar acceso demo para el correo: ${email}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <MessageSquare size={14} /> Abrir WhatsApp con mi Solicitud (098 356 320)
                  </a>
                  
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
