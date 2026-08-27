import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Sparkles, X, CheckCircle, 
  ArrowRight, RefreshCw, AlertCircle, ShoppingBag, 
  User, MapPin, Phone, CreditCard, DollarSign, UtensilsCrossed,
  Volume2, Trash2, Plus, Search, Users, Edit3, ArrowUpRight, Zap, Play, Check, Flame, PlusCircle
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
  { label: '🍕 1 Metro Muzza c/ Panceta', text: '1 metro de muzza con panceta' },
  { label: '🧀 1 Metro Muzza Clásica', text: '1 metro de musa' },
  { label: '🫓 2 Pizzetas Calabresa', text: '2 pizzetas calabresa' },
  { label: '🧈 2 Fainás con Queso', text: '2 faina con queso' },
  { label: '🥤 2 Coca Colas 1.5L', text: '2 coca colas' },
  { label: '🍺 1 Cerveza Patricia', text: '1 cerveza' },
  { label: '🥪 1 Sándwich Caliente', text: '1 sandwich caliente' },
  { label: '📍 Para Enviar a 18 de Julio 1234', text: 'delivery para Juan al 098356320 direccion 18 de Julio 1234 con debito' },
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

  // Accumulated items across multiple voice turns
  const [accumulatedCart, setAccumulatedCart] = useState<CartItem[]>([]);
  const [orderClient, setOrderClient] = useState<OrderClient>({ nombre: '', mesa: '', telefono: '', direccion: '' });
  const [orderPayment, setOrderPayment] = useState<OrderPayment>({
    tipo: 'local',
    metodo: 'efectivo',
    notas: '',
    programado: false,
    horaProgramada: '',
    abono: '',
    propina: '',
    cadete: 'Samuel',
  });

  // Current detected item from active dictation
  const [currentDetected, setCurrentDetected] = useState<ParsedOrderResult | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setCurrentDetected(null);
      setAccumulatedCart([]);
    }
  }, [isOpen]);

  // Parse voice text instantly whenever transcript changes
  useEffect(() => {
    if (!transcript.trim()) {
      setCurrentDetected(null);
      return;
    }

    const localParsed = parseOrderLocally(transcript, menuItems, gustosAdicionales, clients);
    setCurrentDetected(localParsed);

    // If client data detected in current voice turn, auto update orderClient / orderPayment
    if (localParsed.cliente.nombre || localParsed.cliente.telefono || localParsed.cliente.direccion || localParsed.cliente.mesa) {
      setOrderClient(prev => ({
        nombre: localParsed.cliente.nombre || prev.nombre,
        telefono: localParsed.cliente.telefono || prev.telefono,
        direccion: localParsed.cliente.direccion || prev.direccion,
        mesa: localParsed.cliente.mesa || prev.mesa,
      }));
    }
    if (localParsed.pago.tipo && localParsed.pago.tipo !== 'local') {
      setOrderPayment(prev => ({
        ...prev,
        tipo: localParsed.pago.tipo,
        metodo: localParsed.pago.metodo || prev.metodo,
        abono: localParsed.pago.abono || prev.abono,
      }));
    }
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

  // Add currently detected item to the accumulated comanda and clear transcript for next item
  const handleAddCurrentItemToComanda = () => {
    if (!currentDetected || currentDetected.cart.length === 0) return;

    setAccumulatedCart(prev => {
      const next = [...prev];
      currentDetected.cart.forEach(newItem => {
        const existingIdx = next.findIndex(item => item.nombre === newItem.nombre && JSON.stringify(item.gustos || []) === JSON.stringify(newItem.gustos || []));
        if (existingIdx >= 0) {
          next[existingIdx] = {
            ...next[existingIdx],
            cantidad: (next[existingIdx].cantidad || 1) + (newItem.cantidad || 1),
          };
        } else {
          next.push(newItem);
        }
      });
      return next;
    });

    // Reset current voice box to start listening for the next product
    setTranscript('');
    setCurrentDetected(null);
  };

  // Remove individual item from accumulated comanda
  const handleRemoveAccumulatedItem = (idx: number) => {
    setAccumulatedCart(prev => prev.filter((_, i) => i !== idx));
  };

  // Final apply to POS / Cocina
  const handleFinalConfirm = (directConfirm = false) => {
    // If there's an unadded item currently in transcript, auto add it
    let finalCart = [...accumulatedCart];
    if (currentDetected && currentDetected.cart.length > 0) {
      currentDetected.cart.forEach(newItem => {
        const existingIdx = finalCart.findIndex(item => item.nombre === newItem.nombre && JSON.stringify(item.gustos || []) === JSON.stringify(newItem.gustos || []));
        if (existingIdx >= 0) {
          finalCart[existingIdx] = {
            ...finalCart[existingIdx],
            cantidad: (finalCart[existingIdx].cantidad || 1) + (newItem.cantidad || 1),
          };
        } else {
          finalCart.push(newItem);
        }
      });
    }

    if (finalCart.length === 0) {
      alert('No hay productos agregados en la comanda. Dicta o selecciona productos primero.');
      return;
    }

    const totalCalculado = finalCart.reduce((a, b) => a + (b.precioUnitario || b.precio || 0) * (b.cantidad || 1), 0);
    const result: ParsedOrderResult = {
      cart: finalCart,
      cliente: orderClient,
      pago: orderPayment,
      resumen: `Comanda de ${finalCart.reduce((a, b) => a + b.cantidad, 0)} productos. Total: $${totalCalculado}`,
      source: 'local_smart',
      rawText: transcript,
    };

    onApplyToOrder(result, directConfirm);
    onClose();
  };

  if (!isOpen) return null;

  const totalComanda = accumulatedCart.reduce((a, b) => a + (b.precioUnitario || b.precio || 0) * (b.cantidad || 1), 0) +
    (currentDetected ? currentDetected.cart.reduce((a, b) => a + (b.precioUnitario || b.precio || 0) * (b.cantidad || 1), 0) : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-sans">
      <div className="bg-[#0a0f1c] border border-blue-500/40 rounded-3xl w-full max-w-6xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="px-5 py-3 bg-gradient-to-r from-blue-950/70 via-[#0e1629] to-purple-950/50 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
                  Toma de Pedidos por Voz Ítem por Ítem
                </h3>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full uppercase">
                  ● Grabación Continua Acumulativa
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

        {/* 2-COLUMN WIDE BODY */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          
          {/* LEFT COLUMN: LIVE VOICE INPUT & CURRENT DETECTED ITEM (6 COLS) */}
          <div className="lg:col-span-6 bg-[#070b16] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            
            {/* MIC BUTTON & STATUS */}
            <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-2xl border border-white/5">
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
                  {isListening ? '🎙️ Escuchando... Di un producto y toca agregar' : 'Toca el micrófono para dictar un ítem'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Ej: "1 metro de musa", "un faina con queso", "2 cocas"
                </span>
              </div>

              {transcript && (
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="text-[10px] font-mono text-slate-400 hover:text-white bg-white/5 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Borrar
                </button>
              )}
            </div>

            {/* LIVE TRANSCRIPT INPUT */}
            <div className="space-y-1 flex-1 flex flex-col">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block flex justify-between">
                <span>Dictado Actual:</span>
                {transcript && <span className="text-emerald-400">✓ Reconociendo en vivo</span>}
              </label>
              <textarea
                rows={2}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Dicta un producto (ej: 'un metro de musa con jamon')..."
                className="w-full bg-black/80 border border-white/15 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 outline-none font-mono resize-none custom-scrollbar"
              />
            </div>

            {/* CURRENT ITEM PREVIEW + ADD BUTTON */}
            {currentDetected && currentDetected.cart.length > 0 && (
              <div className="bg-blue-950/40 border border-blue-500/40 p-3 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-blue-300 font-bold uppercase block">
                    ✓ Ítem Detectado:
                  </span>
                  <div className="font-bold text-white text-xs truncate">
                    {currentDetected.cart[0].cantidad}x {currentDetected.cart[0].nombre}
                  </div>
                  {currentDetected.cart[0].gustos && currentDetected.cart[0].gustos.length > 0 && (
                    <div className="text-[9px] text-emerald-300 truncate">
                      +{currentDetected.cart[0].gustos.map(g => g.nombre).join(', ')}
                    </div>
                  )}
                  <span className="text-[11px] font-mono font-extrabold text-blue-400">
                    ${(currentDetected.cart[0].precioUnitario || currentDetected.cart[0].precio || 0) * (currentDetected.cart[0].cantidad || 1)} UYU
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddCurrentItemToComanda}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                >
                  <PlusCircle size={15} />
                  <span>Subir a Comanda</span>
                </button>
              </div>
            )}

            {/* QUICK TEMPLATES */}
            <div className="pt-1 border-t border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
                <Flame size={11} className="text-amber-400" /> Dictados Rápidos de 1 Clic:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_VOICE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(tmpl.text);
                    }}
                    className="text-[10px] bg-black/60 hover:bg-blue-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/40 p-1.5 rounded-xl text-left transition-all cursor-pointer font-medium truncate"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-2 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-[10px] flex items-center gap-2">
                <AlertCircle size={13} className="shrink-0 text-red-400" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: ACCUMULATED COMANDA LIST (6 COLS) */}
          <div className="lg:col-span-6 bg-[#0e1629] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xl">
            
            {/* COMANDA HEADER */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                  Comanda Acumulada ({accumulatedCart.length + (currentDetected?.cart.length || 0)} ítems)
                </h4>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-xl">
                Total: ${totalComanda} UYU
              </span>
            </div>

            {/* ACCUMULATED ITEMS LIST TABLE */}
            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-48 custom-scrollbar pr-1">
              {accumulatedCart.length === 0 && (!currentDetected || currentDetected.cart.length === 0) ? (
                <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center text-slate-500 space-y-1 p-4 border border-dashed border-white/10 rounded-xl">
                  <ShoppingBag size={24} className="text-slate-600" />
                  <p className="text-xs text-slate-400 font-medium">La comanda está vacía</p>
                  <p className="text-[10px] text-slate-500">Dicta un producto a la izquierda y presiona "Subir a Comanda".</p>
                </div>
              ) : (
                <>
                  {accumulatedCart.map((item, idx) => (
                    <div key={idx} className="bg-black/70 border border-white/10 p-2.5 rounded-xl flex justify-between items-center animate-in fade-in">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-black font-mono text-xs">{item.cantidad}x</span>
                          <span className="font-bold text-white text-xs uppercase truncate">{item.nombre}</span>
                        </div>
                        {item.gustos && item.gustos.length > 0 && (
                          <div className="text-[9px] text-emerald-300 truncate">
                            +{item.gustos.map(g => g.nombre).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="font-mono font-bold text-white text-xs">
                          ${(item.precioUnitario || item.precio || 0) * (item.cantidad || 1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAccumulatedItem(idx)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {currentDetected && currentDetected.cart.length > 0 && (
                    <div className="bg-blue-950/30 border border-blue-500/30 border-dashed p-2 rounded-xl flex justify-between items-center opacity-80">
                      <div className="flex items-center gap-1.5 text-xs text-blue-300">
                        <span className="font-bold font-mono text-xs">{currentDetected.cart[0].cantidad}x</span>
                        <span className="font-semibold uppercase truncate">{currentDetected.cart[0].nombre} (detectando...)</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        ${(currentDetected.cart[0].precioUnitario || currentDetected.cart[0].precio || 0) * (currentDetected.cart[0].cantidad || 1)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* DESTINATION & CLIENT FOOTER BAR */}
            <div className="grid grid-cols-3 gap-2 bg-black/50 p-2 rounded-xl border border-white/5 text-[11px]">
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Destino:</span>
                <span className="font-bold text-cyan-300 uppercase font-mono truncate block">
                  📍 {orderPayment.tipo}
                  {orderClient.mesa ? ` (Mesa ${orderClient.mesa})` : ''}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Cliente:</span>
                <span className="font-bold text-white truncate block">
                  {orderClient.nombre || 'Mostrador'}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Pago:</span>
                <span className="font-bold text-emerald-400 uppercase font-mono truncate block">
                  💳 {orderPayment.metodo}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="pt-2 border-t border-white/10 flex gap-2">
              {accumulatedCart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAccumulatedCart([])}
                  className="px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Vaciar comanda"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <button
                type="button"
                disabled={accumulatedCart.length === 0 && (!currentDetected || currentDetected.cart.length === 0)}
                onClick={() => handleFinalConfirm(false)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Cargar al POS</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                disabled={accumulatedCart.length === 0 && (!currentDetected || currentDetected.cart.length === 0)}
                onClick={() => handleFinalConfirm(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle size={14} />
                <span>Confirmar Toda la Comanda</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
