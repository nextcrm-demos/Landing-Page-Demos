import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Sparkles, X, CheckCircle, 
  ArrowRight, RefreshCw, AlertCircle, ShoppingBag, 
  User, MapPin, Phone, CreditCard, DollarSign, UtensilsCrossed,
  Volume2, Trash2, Plus, Search, Users, Edit3, ArrowUpRight, Zap
} from 'lucide-react';
import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Client } from '../types';
import { parseOrderLocally, parseOrderWithAI, ParsedOrderResult } from '../utils/aiOrderParser';
import { defaultClients } from '../data/defaults';

interface AIOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  clients?: Client[];
  onApplyToOrder: (result: ParsedOrderResult, directConfirm?: boolean) => void;
  initialMode?: 'guided_voice' | 'voice' | 'whatsapp';
}

const QUICK_EXAMPLES = [
  '1 metro de muzza mitad panceta y aceitunas con 2 fainás para enviar a 18 de Julio 1234 a nombre de Juan paga con 2000',
  '2 pizzetas cuatro quesos y 1 coca cola de litro y medio para retirar acá',
  '1 pizza muzzarella con fainá para mesa 4 paga con tarjeta débito',
  '1/2 metro de calabresa con aceitunas para enviar a Jackson 1420',
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

  // Extracted Comanda State
  const [parsedCart, setParsedCart] = useState<CartItem[]>([]);
  const [parsedClient, setParsedClient] = useState<OrderClient>({ nombre: '', mesa: '', telefono: '', direccion: '' });
  const [parsedPayment, setParsedPayment] = useState<OrderPayment>({
    tipo: 'local',
    metodo: 'efectivo',
    notas: '',
    programado: false,
    horaProgramada: '',
    abono: '',
    propina: '',
    cadete: 'Samuel',
  });

  // Client Search & DB Lookup
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);
  const clientDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
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

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir la frase abajo.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-UY';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        const clean = currentText.trim();
        setTranscript(clean);
        processTextWithAI(clean);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setErrorMessage(`Error de micrófono: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMessage('No se pudo iniciar el micrófono.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processTextWithAI = (text: string) => {
    if (!text.trim()) return;
    setIsParsing(true);
    
    // Parse locally first for instant real-time feedback
    const parsed = parseOrderLocally(text, menuItems);
    
    if (parsed.cart && parsed.cart.length > 0) {
      setParsedCart(parsed.cart);
    }
    if (parsed.client) {
      setParsedClient(prev => ({ ...prev, ...parsed.client }));
    }
    if (parsed.payment) {
      setParsedPayment(prev => ({ ...prev, ...parsed.payment }));
    }

    setIsParsing(false);
  };

  const handleSelectClientFromDB = (c: Client) => {
    setParsedClient({
      nombre: c.nombre,
      telefono: c.telefono,
      direccion: c.direccion,
      mesa: '',
    });
    setParsedPayment(prev => ({ ...prev, tipo: 'envio' }));
    setIsClientDropdownOpen(false);
  };

  const handleRemoveCartItem = (idx: number) => {
    setParsedCart(parsedCart.filter((_, i) => i !== idx));
  };

  const totalAmount = parsedCart.reduce((sum, it) => sum + (it.precioUnitario * it.cantidad), 0);

  const filteredClients = clients.filter(c => {
    const q = clientSearch.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || c.telefono.includes(q) || c.direccion.toLowerCase().includes(q);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[120] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* MODAL TOP HEADER */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Toma de Pedidos por Voz con IA
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Dicta o pega el pedido y la IA armará la comanda automáticamente
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (2-COLUMN INTERACTIVE WORKSPACE) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          
          {/* LEFT COLUMN: HERO VOICE INPUT & TRANSCRIPT (5 COLUMNS) */}
          <div className="md:col-span-5 p-5 border-r border-white/10 flex flex-col justify-between bg-[#060a14] overflow-y-auto custom-scrollbar">
            
            {/* MICROPHONE BUTTON & STATUS */}
            <div className="flex flex-col items-center text-center my-auto py-4">
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white ring-8 ring-emerald-500/20 hover:scale-105'
                }`}
              >
                {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              </button>

              <p className="font-bold text-sm text-white mt-4 uppercase tracking-wider">
                {isListening ? '🔴 Escuchando en Vivo...' : 'Toca para Dictar Pedido'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isListening ? 'Habla con naturalidad (productos, cliente, dirección)' : 'Micrófono activo en español'}
              </p>

              {errorMessage && (
                <div className="mt-3 p-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-[11px] flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* TRANSCRIPTION INPUT / TEXT AREA */}
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                <span>Texto Detectado en Vivo:</span>
                {transcript && (
                  <button 
                    onClick={() => {
                      setTranscript('');
                      setParsedCart([]);
                    }}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    Borrar
                  </button>
                )}
              </div>

              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  processTextWithAI(e.target.value);
                }}
                placeholder="Ejemplo: 1 metro de muzzarella con fainá para enviar a Jackson 1420 a nombre de Juan..."
                rows={3}
                className="w-full bg-black/60 border border-white/15 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none transition-colors font-mono resize-none"
              />

              {/* QUICK EXAMPLE CHIPS */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-1">
                  O prueba con un ejemplo en 1 clic:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTranscript(ex);
                        processTextWithAI(ex);
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-slate-300 text-left hover:text-white transition-all cursor-pointer truncate max-w-full"
                    >
                      💡 {ex.substring(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE VISUAL COMANDA (7 COLUMNS) */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between bg-[#0a0f1c] overflow-y-auto custom-scrollbar">
            
            <div className="space-y-4">
              
              {/* SECTION 1: DETECTED PRODUCTS */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-emerald-400" />
                    Productos en Comanda ({parsedCart.length})
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Total: ${totalAmount}
                  </span>
                </div>

                {parsedCart.length === 0 ? (
                  <div className="p-6 bg-black/30 border border-dashed border-white/10 rounded-2xl text-center text-slate-500 text-xs">
                    <span>Aún no hay productos detectados. Dicta tu pedido para armar la comanda.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {parsedCart.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="bg-black/50 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                            {item.cantidad}x
                          </span>
                          <div>
                            <p className="font-bold text-white">{item.nombre}</p>
                            {item.notas && (
                              <p className="text-[10px] text-amber-300 font-mono">
                                + {item.notas}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-white">
                            ${item.precioUnitario * item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(idx)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: CLIENT & DESTINATION */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <User size={13} className="text-blue-400" />
                    Cliente & Destino
                  </span>

                  {/* DESTINATION PILLS */}
                  <div className="flex gap-1">
                    {[
                      { id: 'local', label: 'Mostrador' },
                      { id: 'envio', label: 'Delivery' },
                      { id: 'mesa', label: 'Mesa' },
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setParsedPayment({ ...parsedPayment, tipo: d.id as any })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          parsedPayment.tipo === d.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CLIENT SEARCH / DROPDOWN FROM DB */}
                <div className="relative" ref={clientDropdownRef}>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Vincular con Cliente de Base de Datos..."
                      value={clientSearch}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setIsClientDropdownOpen(true);
                      }}
                      className="w-full bg-black/60 border border-white/15 focus:border-blue-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none font-mono"
                    />
                  </div>

                  {isClientDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-[#0e1626] border border-blue-500/40 rounded-xl shadow-2xl max-h-40 overflow-y-auto z-30 divide-y divide-white/5 custom-scrollbar">
                      {filteredClients.map(c => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectClientFromDB(c)}
                          className="p-2 hover:bg-blue-600/20 cursor-pointer flex justify-between items-center text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{c.nombre}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{c.direccion} • {c.telefono}</p>
                          </div>
                          <span className="text-[10px] text-blue-300 font-bold bg-blue-950 px-1.5 py-0.5 rounded">
                            Seleccionar
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CLIENT DATA INPUTS */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Nombre del Cliente"
                    value={parsedClient.nombre}
                    onChange={(e) => setParsedClient({ ...parsedClient, nombre: e.target.value })}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none"
                  />
                  {parsedPayment.tipo === 'mesa' ? (
                    <input
                      type="text"
                      placeholder="Nº de Mesa (ej: Mesa 4)"
                      value={parsedClient.mesa}
                      onChange={(e) => setParsedClient({ ...parsedClient, mesa: e.target.value })}
                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={parsedClient.telefono}
                      onChange={(e) => setParsedClient({ ...parsedClient, telefono: e.target.value })}
                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none font-mono"
                    />
                  )}
                </div>

                {parsedPayment.tipo === 'envio' && (
                  <input
                    type="text"
                    placeholder="Dirección de Entrega (ej: 18 de Julio 1234 esq. Cuareim)"
                    value={parsedClient.direccion}
                    onChange={(e) => setParsedClient({ ...parsedClient, direccion: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                )}
              </div>

              {/* SECTION 3: PAYMENT METHOD & NOTES */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <CreditCard size={13} className="text-amber-400" />
                    Medio de Pago & Abono
                  </span>

                  <div className="flex gap-1">
                    {['efectivo', 'debito', 'credito', 'transferencia'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setParsedPayment({ ...parsedPayment, metodo: m as any })}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          parsedPayment.metodo === m
                            ? 'bg-amber-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Abona con $ (ej: 2000)"
                    value={parsedPayment.abono}
                    onChange={(e) => setParsedPayment({ ...parsedPayment, abono: e.target.value })}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Notas / Aclaraciones"
                    value={parsedPayment.notas}
                    onChange={(e) => setParsedPayment({ ...parsedPayment, notas: e.target.value })}
                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-white outline-none"
                  />
                </div>
              </div>

            </div>

            {/* ACTION BUTTONS (APPLY TO POS OR SEND DIRECT TO KITCHEN) */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2.5 mt-4">
              <button
                type="button"
                disabled={parsedCart.length === 0}
                onClick={() => {
                  onApplyToOrder({
                    cart: parsedCart,
                    client: parsedClient,
                    payment: parsedPayment,
                    rawTranscript: transcript,
                  }, false);
                  onClose();
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <ShoppingBag size={15} /> Cargar en POS
              </button>

              <button
                type="button"
                disabled={parsedCart.length === 0}
                onClick={() => {
                  onApplyToOrder({
                    cart: parsedCart,
                    client: parsedClient,
                    payment: parsedPayment,
                    rawTranscript: transcript,
                  }, true);
                  onClose();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={15} /> Confirmar y Enviar a Cocina
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
