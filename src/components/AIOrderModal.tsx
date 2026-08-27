import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Sparkles, X, CheckCircle, 
  ArrowRight, RefreshCw, AlertCircle, ShoppingBag, 
  User, MapPin, Phone, CreditCard, DollarSign, UtensilsCrossed,
  Volume2, Trash2, Plus, Search, Users, Edit3, ArrowUpRight, Zap, Play, Check, Flame
} from 'lucide-react';
import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Client } from '../types';
import { parseOrderLocally, parseOrderWithAI, ParsedOrderResult } from '../utils/aiOrderParser';
import { gustosAdicionales, defaultClients } from '../data/defaults';

interface AIOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  clients?: Client[];
  onApplyToOrder: (result: ParsedOrderResult, directConfirm?: boolean) => void;
  initialMode?: 'guided_voice' | 'voice' | 'whatsapp';
}

const QUICK_VOICE_TEMPLATES = [
  {
    label: '🍕 1 Metro Muzza c/ Panceta y Jamón',
    text: '1 metro de muzza con panceta y jamón para Juan al 098356320 para enviar a 18 de Julio 1234 con débito',
  },
  {
    label: '🫓 2 Pizzetas Calabresa + Coca',
    text: '2 pizzetas calabresa con roquefort y 1 coca cola para mesa 4',
  },
  {
    label: '🧈 2 Fainás c/ Queso + Cerveza',
    text: '2 porciones de fainá con queso y 1 cerveza mostrador para retirar paga con 1000',
  },
  {
    label: '🥪 Chivito Completo Delivery',
    text: '1 chivito completo para delivery a Bulevar Artigas 450 teléfono 092494927',
  }
];

export function AIOrderModal({
  isOpen,
  onClose,
  menuItems,
  clients = defaultClients,
  onApplyToOrder,
}: AIOrderModalProps) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Current detected item from last dictation
  const [detectedResult, setDetectedResult] = useState<ParsedOrderResult | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setDetectedResult(null);
    }
  }, [isOpen]);

  // Parse voice text instantly whenever transcript changes
  useEffect(() => {
    if (!transcript.trim()) {
      setDetectedResult(null);
      return;
    }

    const localParsed = parseOrderLocally(transcript, menuItems, gustosAdicionales, clients);
    setDetectedResult(localParsed);
  }, [transcript, menuItems, clients]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir o usar las plantillas rápidas.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-UY';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        if (!event || !event.results) return;
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i] && event.results[i][0] && event.results[i][0].transcript) {
            currentText += event.results[i][0].transcript + ' ';
          }
        }
        const clean = currentText.trim();
        if (clean) {
          setTranscript(clean);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorMessage('Permiso de micrófono denegado. Permite el acceso en la barra de direcciones del navegador.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Aviso de micrófono: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMessage('No se pudo iniciar el micrófono. Por favor escribe la orden o selecciona una plantilla.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleProcessWithGemini = async () => {
    if (!transcript.trim()) return;
    setIsParsing(true);
    try {
      const res = await parseOrderWithAI(transcript, menuItems, gustosAdicionales, clients);
      setDetectedResult(res);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAndApply = (directConfirm = false) => {
    if (!detectedResult || detectedResult.cart.length === 0) {
      alert('No se detectaron productos en la frase. Por favor dicta o escribe los productos.');
      return;
    }
    onApplyToOrder(detectedResult, directConfirm);
    onClose();
  };

  if (!isOpen) return null;

  const totalCalculado = detectedResult ? detectedResult.cart.reduce((a, b) => a + (b.precioUnitario || b.precio || 0) * (b.cantidad || 1), 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-sans">
      <div className="bg-[#0a0f1c] border border-blue-500/40 rounded-3xl w-full max-w-6xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* MODAL HEADER - COMPACT */}
        <div className="px-5 py-3 bg-gradient-to-r from-blue-950/70 via-[#0e1629] to-purple-950/50 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  Toma de Pedidos por Voz con IA (Gemini Flash 2.0)
                </h3>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full uppercase">
                  ● 0ms Latencia
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-COLUMN WIDE BODY (NO SCROLLING ON STANDARD SCREENS) */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* LEFT COLUMN: MIC + LIVE TRANSCRIPT + QUICK TEMPLATES (5 COLS) */}
          <div className="lg:col-span-6 bg-[#070b16] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            
            {/* MIC BUTTON & LIVE STATUS */}
            <div className="flex items-center gap-3.5 bg-black/50 p-2.5 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse'
                    : 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white hover:scale-105 shadow-blue-500/20'
                }`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold font-mono uppercase tracking-wider block truncate ${isListening ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {isListening ? '🎙️ Escuchando en vivo... ¡Habla ahora!' : 'Toca el micrófono para dictar'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {isListening ? 'Vuelve a tocar para detener el micrófono' : 'Reconocimiento continuo de voz en español'}
                </span>
              </div>

              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[10px] font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* TRANSCRIPTION BOX */}
            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block flex justify-between">
                <span>Texto Dictado / Escrito:</span>
                {transcript && <span className="text-emerald-400">✓ {transcript.split(' ').length} palabras</span>}
              </label>
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Ejemplo: '1 metro de muzza con panceta y jamón para Juan al 098356320 delivery a 18 de Julio 1234 con débito'..."
                className="w-full flex-1 bg-black/80 border border-white/15 focus:border-blue-500 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none font-mono leading-relaxed resize-none custom-scrollbar"
              />
            </div>

            {/* QUICK AUDIO TEMPLATES CHIPS */}
            <div className="pt-1 border-t border-white/5 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
                <Flame size={11} className="text-amber-400" /> Plantillas de 1 Clic para Probar:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_VOICE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTranscript(tmpl.text)}
                    className="text-[10px] bg-black/60 hover:bg-blue-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/40 p-2 rounded-xl text-left transition-all cursor-pointer font-medium truncate"
                    title={tmpl.text}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-[11px] flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-red-400" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: REAL-TIME RECOGNIZED ORDER PREVIEW (6 COLS) */}
          <div className="lg:col-span-6 bg-[#0e1629] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
            
            {/* CARD HEADER */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  Comanda Reconocida en Tiempo Real
                </h4>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-xl">
                Total: ${totalCalculado} UYU
              </span>
            </div>

            {/* DETECTED PRODUCTS LIST */}
            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-44 custom-scrollbar pr-1">
              {!detectedResult || detectedResult.cart.length === 0 ? (
                <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center text-slate-500 space-y-1.5 p-4 border border-dashed border-white/10 rounded-xl">
                  <Mic size={24} className="text-slate-600" />
                  <p className="text-xs text-slate-400 font-medium">Dicta o selecciona una plantilla para ver los productos reconocidos</p>
                  <p className="text-[10px] text-slate-500">Detecta pizzas, gustos de $30, bebidas, cliente y dirección automáticamente.</p>
                </div>
              ) : (
                detectedResult.cart.map((item, idx) => (
                  <div key={idx} className="bg-black/60 border border-white/10 p-2.5 rounded-xl flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 font-black font-mono text-xs">{item.cantidad}x</span>
                        <span className="font-bold text-white text-xs uppercase">{item.nombre}</span>
                      </div>
                      {item.gustos && item.gustos.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.gustos.map(g => (
                            <span key={g.id} className="text-[9px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              + {g.nombre} (+$30)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      ${(item.precioUnitario || item.precio || 0) * (item.cantidad || 1)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* CLIENT & PAYMENT DETAILS */}
            {detectedResult && detectedResult.cart.length > 0 && (
              <div className="grid grid-cols-3 gap-2 bg-black/50 p-2.5 rounded-xl border border-white/5 text-[11px]">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Destino:</span>
                  <span className="font-bold text-cyan-300 uppercase font-mono truncate block">
                    📍 {detectedResult.pago.tipo}
                    {detectedResult.cliente.mesa ? ` (Mesa ${detectedResult.cliente.mesa})` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Cliente:</span>
                  <span className="font-bold text-white truncate block">
                    {detectedResult.cliente.nombre || 'Mostrador'}
                  </span>
                  {detectedResult.cliente.telefono && (
                    <span className="text-[9px] font-mono text-slate-400 block truncate">Tel: {detectedResult.cliente.telefono}</span>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Pago:</span>
                  <span className="font-bold text-emerald-400 uppercase font-mono truncate block">
                    💳 {detectedResult.pago.metodo}
                  </span>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                disabled={!detectedResult || detectedResult.cart.length === 0}
                onClick={() => handleConfirmAndApply(false)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Cargar al POS</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                disabled={!detectedResult || detectedResult.cart.length === 0}
                onClick={() => handleConfirmAndApply(true)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle size={14} />
                <span>Confirmar Directo</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
