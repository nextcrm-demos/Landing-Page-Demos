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

const VOICE_CHUNKS_EXAMPLES = [
  '1 metro de muzza con panceta y aceitunas',
  '2 fainás con queso',
  '1 pizzeta cuatro quesos',
  '1 coca cola de litro y medio',
  '1 pizza napolitana para retirar acá',
  '1 porción de fainá a caballo',
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

  // Accumulated comanda state
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

  // Parse voice text incrementally whenever transcript changes
  useEffect(() => {
    if (!transcript.trim()) {
      setDetectedResult(null);
      return;
    }

    const timer = setTimeout(() => {
      const localParsed = parseOrderLocally(transcript, menuItems, clients);
      setDetectedResult(localParsed);
      
      // If client detected, pre-fill if not set
      if (localParsed.cliente.nombre && !orderClient.nombre) {
        setOrderClient(prev => ({
          ...prev,
          nombre: localParsed.cliente.nombre || prev.nombre,
          telefono: localParsed.cliente.telefono || prev.telefono,
          direccion: localParsed.cliente.direccion || prev.direccion,
          mesa: localParsed.cliente.mesa || prev.mesa,
        }));
      }
      if (localParsed.pago.tipo && orderPayment.tipo === 'local' && localParsed.pago.tipo !== 'local') {
        setOrderPayment(prev => ({
          ...prev,
          tipo: localParsed.pago.tipo,
          metodo: localParsed.pago.metodo || prev.metodo,
          abono: localParsed.pago.abono || prev.abono,
        }));
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [transcript, menuItems, clients]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir la frase en el campo.');
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
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Error de micrófono: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMessage('No se pudo acceder al micrófono.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Add detected items into the accumulated comanda
  const handleAddDetectedToComanda = () => {
    if (!detectedResult || detectedResult.items.length === 0) return;

    setAccumulatedCart(prev => [...prev, ...detectedResult.items]);
    setTranscript('');
    setDetectedResult(null);
  };

  const handleQuickDictateExample = (exampleText: string) => {
    setTranscript(exampleText);
    const parsed = parseOrderLocally(exampleText, menuItems, clients);
    setDetectedResult(parsed);
  };

  const handleRemoveCartItem = (index: number) => {
    setAccumulatedCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSelectClient = (c: Client) => {
    setOrderClient({
      nombre: c.nombre,
      telefono: c.telefono,
      direccion: c.direccion || '',
      mesa: '',
    });
    if (c.direccion) {
      setOrderPayment(prev => ({ ...prev, tipo: 'envio' }));
    }
    setIsClientDropdownOpen(false);
    setClientSearch('');
  };

  const totalComandaPrice = accumulatedCart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);

  const handleSendToPOS = () => {
    const finalResult: ParsedOrderResult = {
      items: accumulatedCart,
      cliente: orderClient,
      pago: orderPayment,
      total: totalComandaPrice,
      notas: '',
      confianza: 95
    };
    onApplyToOrder(finalResult, false);
    onClose();
  };

  const handleSendDirectToKitchen = () => {
    const finalResult: ParsedOrderResult = {
      items: accumulatedCart,
      cliente: orderClient,
      pago: orderPayment,
      total: totalComandaPrice,
      notas: '',
      confianza: 95
    };
    onApplyToOrder(finalResult, true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a0f1c] border border-blue-500/40 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white relative">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Mic size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide">
                  Toma de Pedidos por Voz — <span className="text-blue-400">Paso a Paso</span>
                </h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full border border-blue-500/30 font-bold uppercase">
                  IA Gastronómica
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Habla o escribe de a un producto y agrégalo a la comanda con 1 clic.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* MAIN BODY: 2 COLUMNS */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto custom-scrollbar divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          
          {/* LEFT COLUMN: DICTATION & RECOGNITION (COL 7) */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Volume2 size={15} className="text-blue-400" /> Dictar Producto Actual
                </span>
                <span className="text-[11px] text-slate-400">
                  {isListening ? '🔴 Escuchando...' : '⚪ Micrófono en espera'}
                </span>
              </div>

              {/* VOICE RECORDER BIG BOX */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-4 relative mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-lg ${
                      isListening
                        ? 'bg-red-600 text-white animate-pulse shadow-red-600/40'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-105'
                    }`}
                  >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Habla o escribe: '1 metro de muzza con panceta'..."
                      className="w-full bg-transparent border-none text-sm text-white placeholder:text-slate-500 outline-none font-medium"
                    />
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>💡 Haz clic en el micrófono o escribe</span>
                      {transcript && (
                        <button
                          onClick={() => setTranscript('')}
                          className="text-red-400 hover:underline cursor-pointer ml-auto"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* DETECTED ITEM HIGHLIGHT CARD */}
              {detectedResult && detectedResult.items.length > 0 ? (
                <div className="bg-[#0e1b33] border-2 border-blue-500/70 rounded-2xl p-4 shadow-lg animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-blue-400" /> Producto Reconocido:
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ${detectedResult.items.reduce((s, i) => s + (i.precioUnitario * i.cantidad), 0)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {detectedResult.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/10">
                        <div>
                          <div className="flex items-center gap-2 font-bold text-sm text-white">
                            <span className="text-blue-400">{item.cantidad}x</span>
                            <span>{item.menuItem.nombre}</span>
                          </div>
                          {item.gustos && item.gustos.length > 0 && (
                            <p className="text-xs text-amber-300 font-medium mt-0.5">
                              + Gustos: {item.gustos.map(g => g.nombre).join(', ')}
                            </p>
                          )}
                          {item.notas && (
                            <p className="text-[11px] text-slate-400 italic mt-0.5">
                              "{item.notas}"
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold font-mono text-white">
                          ${item.precioUnitario * item.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* PROMINENT ADD TO COMANDA BUTTON */}
                  <button
                    type="button"
                    onClick={handleAddDetectedToComanda}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101"
                  >
                    <Plus size={16} /> ➕ Agregar este Producto a la Comanda
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-center text-slate-400 text-xs">
                  <p className="mb-2">Prueba dictando uno de estos productos de ejemplo:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {VOICE_CHUNKS_EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickDictateExample(ex)}
                        className="bg-black/50 hover:bg-blue-600/30 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/40 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CLIENT & DESTINATION AUTOCOMPLETE */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User size={14} className="text-blue-400" /> Destino y Datos del Cliente
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'local', label: 'Retiro Local' },
                  { id: 'envio', label: 'Delivery' },
                  { id: 'mesa', label: 'Mesa Salón' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOrderPayment(prev => ({ ...prev, tipo: t.id as any }))}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                      orderPayment.tipo === t.id
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-black/40 text-slate-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {orderPayment.tipo === 'mesa' ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Número de Mesa (Ej: Mesa 4)"
                      value={orderClient.mesa}
                      onChange={(e) => setOrderClient(prev => ({ ...prev, mesa: e.target.value }))}
                      className="w-full bg-black/60 border border-white/15 p-2 rounded-xl text-xs text-white outline-none focus:border-blue-400"
                    />
                  </div>
                ) : (
                  <div className="relative" ref={clientDropdownRef}>
                    <input
                      type="text"
                      placeholder="Nombre del Cliente (o buscar en BD)"
                      value={orderClient.nombre || clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setOrderClient(prev => ({ ...prev, nombre: e.target.value }));
                        setIsClientDropdownOpen(true);
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="w-full bg-black/60 border border-white/15 p-2 rounded-xl text-xs text-white outline-none focus:border-blue-400"
                    />
                    {isClientDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c1322] border border-white/20 rounded-xl shadow-2xl max-h-36 overflow-y-auto z-50 custom-scrollbar">
                        {clients
                          .filter(c => c.nombre.toLowerCase().includes((orderClient.nombre || clientSearch).toLowerCase()))
                          .map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectClient(c)}
                              className="w-full text-left p-2 hover:bg-blue-600/30 text-xs border-b border-white/5 transition-colors flex justify-between items-center cursor-pointer"
                            >
                              <span className="font-bold text-white">{c.nombre}</span>
                              <span className="text-[10px] text-slate-400">{c.telefono}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    placeholder="Teléfono / WhatsApp"
                    value={orderClient.telefono}
                    onChange={(e) => setOrderClient(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full bg-black/60 border border-white/15 p-2 rounded-xl text-xs text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {orderPayment.tipo === 'envio' && (
                <div>
                  <input
                    type="text"
                    placeholder="Dirección de Envío (Calle, número, apartamento)"
                    value={orderClient.direccion}
                    onChange={(e) => setOrderClient(prev => ({ ...prev, direccion: e.target.value }))}
                    className="w-full bg-black/60 border border-white/15 p-2 rounded-xl text-xs text-white outline-none focus:border-blue-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACCUMULATED COMANDA & ACTIONS (COL 5) */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-black/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShoppingBag size={15} className="text-emerald-400" /> Comanda Acumulada ({accumulatedCart.reduce((s, i) => s + i.cantidad, 0)})
                </span>
                <span className="text-base font-mono font-black text-white">
                  ${totalComandaPrice}
                </span>
              </div>

              {/* ITEMS LIST */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {accumulatedCart.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-slate-500 text-xs">
                    <ShoppingBag size={28} className="mx-auto mb-2 opacity-30 text-blue-400" />
                    <p>La comanda está vacía.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Dicta un producto a la izquierda y presiona "➕ Agregar".
                    </p>
                  </div>
                ) : (
                  accumulatedCart.map((item, idx) => (
                    <div key={idx} className="bg-[#0a0f1c] border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-sm group">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <span className="text-blue-400 font-mono">{item.cantidad}x</span>
                          <span>{item.menuItem.nombre}</span>
                        </div>
                        {item.gustos && item.gustos.length > 0 && (
                          <p className="text-[11px] text-amber-300 mt-0.5">
                            + {item.gustos.map(g => g.nombre).join(', ')}
                          </p>
                        )}
                        {item.notas && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            "{item.notas}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          ${item.precioUnitario * item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(idx)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ACTIONS FOOTER */}
            <div className="pt-4 border-t border-white/10 space-y-2.5 mt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total a Cobrar:</span>
                <span className="text-xl font-mono font-black text-emerald-400">${totalComandaPrice}</span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={accumulatedCart.length === 0}
                  onClick={handleSendToPOS}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingBag size={15} /> 🛒 Cargar Todo en el Carrito del POS
                </button>

                <button
                  type="button"
                  disabled={accumulatedCart.length === 0}
                  onClick={handleSendDirectToKitchen}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle size={15} /> 🚀 Confirmar y Enviar Directo a Cocina
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
