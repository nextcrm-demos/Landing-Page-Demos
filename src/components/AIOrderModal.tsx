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
    label: '🧈 Fainá c/ Queso + Cerveza',
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

  // Client search dropdown
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const recognitionRef = useRef<any>(null);
  const clientDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setDetectedResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
      <div className="bg-[#0a0f1c] border border-blue-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/60 via-[#0e1629] to-purple-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                  Toma de Pedidos por Voz con IA
                </h3>
                <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase">
                  Gemini Flash 2.0 • Ultra Rápido
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dicta o escribe el pedido de forma natural. La IA detecta ítems, gustos ($30 c/u), cliente, teléfono y entrega al instante.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          
          {/* MICROPHONE & VOICE CONTROL HERO */}
          <div className="bg-[#070b16] border border-white/10 rounded-3xl p-5 sm:p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* BIG PULSING MIC BUTTON */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl relative ${
                  isListening
                    ? 'bg-red-600 text-white ring-8 ring-red-500/30 scale-105 animate-pulse'
                    : 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-blue-500/30'
                }`}
              >
                {isListening ? <MicOff size={34} /> : <Mic size={34} />}
              </button>

              <div>
                <span className={`text-xs font-bold font-mono uppercase tracking-wider block ${isListening ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                  {isListening ? '🎙️ Escuchando tu voz en vivo... ¡Habla ahora!' : 'Toca el micrófono para dictar el pedido'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isListening ? 'Toca nuevamente para detener cuando termines' : 'O escribe en el campo inferior'}
                </span>
              </div>
            </div>

            {/* TRANSCRIPTION TEXTAREA & FAST CONTROLS */}
            <div className="relative text-left">
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Ejemplo: '1 metro de muzza con jamón y panceta para Juan al 098356320 delivery a 18 de Julio 1234 con débito'..."
                className="w-full bg-black/80 border border-white/15 focus:border-blue-500 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-all custom-scrollbar font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTranscript('')}
                    className="text-[10px] text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Borrar Texto
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessWithGemini}
                    disabled={!transcript.trim() || isParsing}
                    className="text-[10px] font-mono text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Zap size={11} className="text-amber-400" /> {isParsing ? 'Procesando...' : 'Re-Procesar con IA'}
                  </button>
                </div>

                {transcript && (
                  <span className="text-[10px] font-mono text-emerald-400">
                    ✓ {transcript.split(' ').length} palabras detectadas
                  </span>
                )}
              </div>
            </div>

            {/* QUICK AUDIO TEMPLATES CHIPS */}
            <div className="text-left pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2 flex items-center gap-1.5">
                <Flame size={12} className="text-amber-400" /> Plantillas de Voz Rápidas (1 Clic para Probar):
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_VOICE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(tmpl.text);
                    }}
                    className="text-[11px] bg-white/5 hover:bg-blue-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

          </div>

          {/* REAL-TIME DETECTED ORDER PREVIEW CARD */}
          {detectedResult && detectedResult.cart.length > 0 && (
            <div className="bg-[#0e1629] border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
                    Comanda Reconocida en Tiempo Real
                  </h4>
                </div>
                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  Total: ${totalCalculado} UYU
                </span>
              </div>

              {/* PRODUCTS LIST */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  Productos ({detectedResult.cart.reduce((a, b) => a + b.cantidad, 0)} ítems):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {detectedResult.cart.map((item, idx) => (
                    <div key={idx} className="bg-black/60 border border-white/10 p-3 rounded-2xl flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-black font-mono text-sm">{item.cantidad}x</span>
                          <span className="font-bold text-white text-xs uppercase">{item.nombre}</span>
                        </div>
                        {item.gustos && item.gustos.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.gustos.map(g => (
                              <span key={g.id} className="text-[9px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
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
                  ))}
                </div>
              </div>

              {/* CLIENT & PAYMENT DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Destino / Modalidad:</span>
                  <span className="font-bold text-cyan-300 uppercase font-mono text-xs">
                    📍 {detectedResult.pago.tipo}
                    {detectedResult.cliente.mesa ? ` (Mesa ${detectedResult.cliente.mesa})` : ''}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Cliente / Teléfono:</span>
                  <span className="font-bold text-white text-xs">
                    {detectedResult.cliente.nombre || 'Mostrador'} {detectedResult.cliente.telefono ? `(${detectedResult.cliente.telefono})` : ''}
                  </span>
                  {detectedResult.cliente.direccion && (
                    <span className="text-[10px] text-slate-400 block truncate">Dir: {detectedResult.cliente.direccion}</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Medio de Pago:</span>
                  <span className="font-bold text-emerald-400 uppercase font-mono text-xs">
                    💳 {detectedResult.pago.metodo}
                    {detectedResult.pago.abono ? ` (Paga con $${detectedResult.pago.abono})` : ''}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-black/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            {detectedResult && detectedResult.cart.length > 0
              ? `✓ Listo para confirmar ${detectedResult.cart.reduce((a, b) => a + b.cantidad, 0)} productos`
              : 'Dicta tu orden para habilitar la confirmación.'}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase cursor-pointer transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!detectedResult || detectedResult.cart.length === 0}
              onClick={() => handleConfirmAndApply(false)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Cargar al POS</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              disabled={!detectedResult || detectedResult.cart.length === 0}
              onClick={() => handleConfirmAndApply(true)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle size={15} />
              <span>Confirmar Directo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
