import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Sparkles, X, CheckCircle, 
  ArrowRight, RefreshCw, AlertCircle, ShoppingBag, 
  User, MapPin, Phone, CreditCard, DollarSign, UtensilsCrossed,
  Volume2, VolumeX, ChevronDown, ChevronUp, GripVertical, Check, Plus, Trash2,
  Play, Pause, Square, Radio, MessageSquare, Headphones, Sliders, ShieldAlert,
  RotateCcw, ArrowUpRight, HelpCircle, Search, Users
} from 'lucide-react';
import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Client } from '../types';
import { parseOrderWithAI, parseOrderLocally, ParsedOrderResult } from '../utils/aiOrderParser';
import { defaultClients, gustosAdicionales } from '../data/defaults';

interface AIOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  clients?: Client[];
  onApplyToOrder: (result: ParsedOrderResult, directConfirm?: boolean) => void;
  initialMode?: 'guided_voice' | 'voice' | 'whatsapp';
}

const QUICK_PHRASES = [
  '1 metro de muzza con panceta y aceitunas',
  '2 fainás de orilla con queso y 1 fainá común',
  '1 pizzeta napolitana y 1 cerveza Patricia de litro',
  '1 sándwich caliente con mozzarella para mostrador',
  'Para mandar a Jackson 1420 a nombre de Juan, abona con 2000 en efectivo',
];

export function AIOrderModal({
  isOpen,
  onClose,
  menuItems,
  clients = defaultClients,
  onApplyToOrder,
}: AIOrderModalProps) {
  const [activeMode, setActiveMode] = useState<'voice' | 'whatsapp'>('voice');
  const [currentSpeechChunk, setCurrentSpeechChunk] = useState('');
  const [historyTranscript, setHistoryTranscript] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Client Search & Database Autocomplete
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [showClientPickerModal, setShowClientPickerModal] = useState(false);

  // Cumulative Order State
  const [cumulativeCart, setCumulativeCart] = useState<CartItem[]>([]);
  const [detectedClient, setDetectedClient] = useState<OrderClient>({ nombre: '', mesa: '', telefono: '', direccion: '' });
  const [detectedPayment, setDetectedPayment] = useState<OrderPayment>({
    tipo: 'local',
    metodo: 'efectivo',
    notas: '',
    programado: false,
    horaProgramada: '',
    abono: '',
    propina: '',
    cadete: 'Samuel',
  });

  // Direct manual phrase input
  const [manualPhraseInput, setManualPhraseInput] = useState('');

  // Audio Wave & Sound
  const [audioLevel, setAudioLevel] = useState(0);
  const [autoSpeakConfirm, setAutoSpeakConfirm] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const pauseTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const clientDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Handle open / close
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
      setSpeechError(null);
      checkAndRequestMicrophone();
    } else {
      stopVoiceRecognition();
      stopAudioVisualizer();
      stopTTS();
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    }
  }, [isOpen]);

  // Close client dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clients from DB
  const filteredDbClients = clients.filter(c => {
    const query = clientSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return c.nombre.toLowerCase().includes(query) || 
           c.telefono.toLowerCase().includes(query) || 
           c.direccion.toLowerCase().includes(query);
  });

  const selectClientFromDb = (client: Client) => {
    setDetectedClient({
      nombre: client.nombre,
      telefono: client.telefono,
      direccion: client.direccion,
      mesa: '',
    });
    if (client.direccion) {
      setDetectedPayment(prev => ({ ...prev, tipo: 'envio' }));
    }
    setClientSearchQuery('');
    setIsClientDropdownOpen(false);
    setShowClientPickerModal(false);
  };

  // Request Mic Permission & Initialize
  const checkAndRequestMicrophone = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setMicPermissionState('unsupported');
      setSpeechError('Tu navegador no soporta reconocimiento de voz nativo. Puedes usar el modo texto.');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        audioStreamRef.current = stream;
        setMicPermissionState('granted');
        startAudioVisualizer(stream);
        startVoiceRecognition();
      } else {
        startVoiceRecognition();
      }
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermissionState('denied');
        setSpeechError('Permiso de micrófono bloqueado. Haz clic en el ícono del candado o cámara en la barra de tu navegador (arriba) y selecciona "Permitir micrófono".');
      } else {
        setMicPermissionState('prompt');
        setSpeechError('No se pudo acceder al micrófono: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  // Audio Visualizer
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Audio visualizer error:', err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (_) {}
      audioContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // TTS Readout
  const speakOrderSummary = (textToRead: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'es-UY';
      utterance.rate = 1.05;
      utterance.onstart = () => setIsSpeakingTTS(true);
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeakingTTS(false);
    }
  };

  const stopTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
    }
  };

  // Start speech recognition
  const startVoiceRecognition = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Tu navegador no soporta reconocimiento de voz nativo.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-419'; // Robust LatAm Spanish recognition
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const speechText = (currentFinal + currentInterim).trim();
        if (speechText) {
          setCurrentSpeechChunk(speechText);

          // Reset pause timer
          if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

          // When speech pauses for 800ms, process this specific chunk and accumulate
          pauseTimerRef.current = setTimeout(() => {
            processIncrementalSpeech(speechText);
          }, 800);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          setMicPermissionState('denied');
          setSpeechError('Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador.');
          setIsListening(false);
        } else {
          console.warn('Speech status:', event.error);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && isOpen && activeMode === 'voice') {
          try {
            recognition.start();
          } catch (_) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setSpeechError(err.message || 'Error al iniciar micrófono');
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Toggle Mic Button
  const toggleMic = () => {
    if (isListening) {
      if (currentSpeechChunk.trim()) {
        processIncrementalSpeech(currentSpeechChunk);
      }
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  // Process incremental chunk of spoken speech without overwriting previous items
  const processIncrementalSpeech = async (speechText: string) => {
    if (!speechText.trim()) return;

    setIsProcessing(true);
    try {
      const parsed = await parseOrderWithAI(speechText, menuItems);

      // Check if text mentions a known client from database
      const cleanUpper = speechText.toUpperCase();
      const matchedDbClient = clients.find(c => 
        cleanUpper.includes(c.nombre.toUpperCase()) || 
        (c.telefono && cleanUpper.includes(c.telefono))
      );

      if (matchedDbClient) {
        setDetectedClient({
          nombre: matchedDbClient.nombre,
          telefono: matchedDbClient.telefono,
          direccion: matchedDbClient.direccion,
          mesa: '',
        });
        if (matchedDbClient.direccion) {
          setDetectedPayment(prev => ({ ...prev, tipo: 'envio' }));
        }
      } else if (parsed.cliente.nombre || parsed.cliente.telefono || parsed.cliente.direccion || parsed.cliente.mesa) {
        setDetectedClient(prev => ({
          nombre: parsed.cliente.nombre || prev.nombre,
          telefono: parsed.cliente.telefono || prev.telefono,
          direccion: parsed.cliente.direccion || prev.direccion,
          mesa: parsed.cliente.mesa || prev.mesa,
        }));
      }

      // Merge Payment info if detected
      if (parsed.pago.tipo && parsed.pago.tipo !== 'local') {
        setDetectedPayment(prev => ({
          ...prev,
          tipo: parsed.pago.tipo || prev.tipo,
          metodo: parsed.pago.metodo || prev.metodo,
          abono: parsed.pago.abono || prev.abono,
        }));
      }

      // Merge Cart items cumulatively (add to cart without overwriting)
      if (parsed.cart && parsed.cart.length > 0) {
        setCumulativeCart(prev => {
          const next = [...prev];
          parsed.cart.forEach(newItem => {
            const existingIdx = next.findIndex(item => 
              item.id === newItem.id && 
              item.nombre === newItem.nombre &&
              JSON.stringify(item.gustos || []) === JSON.stringify(newItem.gustos || []) &&
              (item.notas || '') === (newItem.notas || '')
            );
            if (existingIdx >= 0) {
              next[existingIdx] = {
                ...next[existingIdx],
                cantidad: next[existingIdx].cantidad + newItem.cantidad,
              };
            } else {
              next.push(newItem);
            }
          });
          return next;
        });

        // Add to transcript log
        setHistoryTranscript(prev => [...prev, speechText]);
        setCurrentSpeechChunk('');

        // Optional TTS confirmation
        if (autoSpeakConfirm && parsed.cart[0]) {
          speakOrderSummary(`Agregado: ${parsed.cart.map(i => `${i.cantidad} ${i.nombre}`).join(', ')}`);
        }
      }
    } catch (err) {
      console.warn('Error parsing incremental speech:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPhraseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhraseInput.trim()) return;
    processIncrementalSpeech(manualPhraseInput.trim());
    setManualPhraseInput('');
  };

  const totalCalculated = cumulativeCart.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);

  const handleApply = (directConfirm = false) => {
    const result: ParsedOrderResult = {
      cart: cumulativeCart,
      cliente: detectedClient,
      pago: detectedPayment,
      resumen: `Pedido por voz con ${cumulativeCart.length} ítems`,
      source: 'local_smart',
      rawText: historyTranscript.join(' | '),
    };
    onApplyToOrder(result, directConfirm);
    onClose();
  };

  const resetAll = () => {
    setCumulativeCart([]);
    setDetectedClient({ nombre: '', mesa: '', telefono: '', direccion: '' });
    setDetectedPayment({
      tipo: 'local',
      metodo: 'efectivo',
      notas: '',
      programado: false,
      horaProgramada: '',
      abono: '',
      propina: '',
      cadete: 'Samuel',
    });
    setHistoryTranscript([]);
    setCurrentSpeechChunk('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* MODAL HEADER */}
        <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-lg">
              <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base uppercase tracking-wider text-white">
                  Pedidos por Voz & Dictado Directo
                </h3>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full">
                  MULTI-PRODUCTO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dicta producto por producto pausando el micrófono entre cada uno
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoSpeakConfirm(!autoSpeakConfirm)}
              className={`p-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                autoSpeakConfirm ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title="Respuesta por voz inteligente"
            >
              {autoSpeakConfirm ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hidden sm:inline">Voz</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          
          {/* MICROPHONE STATUS & LIVE VU BAR */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
            isListening 
              ? 'bg-blue-950/40 border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.2)]' 
              : 'bg-black/50 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold transition-all shadow-xl cursor-pointer ${
                  isListening 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse shadow-blue-500/30' 
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title={isListening ? 'Pausar micrófono' : 'Activar micrófono'}
              >
                {isListening ? <Mic size={26} /> : <MicOff size={26} />}
              </button>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider block text-white">
                  {isListening ? '🎙️ Escuchando en Vivo...' : '⏸️ Micrófono en Pausa'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isListening ? 'Habla y haz una pausa de 1 seg para agregar el producto' : 'Toca el micrófono para comenzar a dictar'}
                </span>
              </div>
            </div>

            {/* LIVE VU METER */}
            <div className="flex items-center gap-1.5 bg-black/60 px-3 py-2 rounded-xl border border-white/10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-6 rounded-full transition-all duration-75 ${
                    audioLevel > i * 12 
                      ? i > 5 ? 'bg-cyan-400' : 'bg-blue-500' 
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 cursor-pointer"
            >
              <RotateCcw size={13} /> Reiniciar Comanda
            </button>
          </div>

          {/* PERMISSION / ERROR BANNER */}
          {speechError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <span>{speechError}</span>
              </div>
            </div>
          )}

          {/* MANUAL PHRASE INPUT BAR */}
          <form onSubmit={handleManualPhraseSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualPhraseInput}
                onChange={e => setManualPhraseInput(e.target.value)}
                placeholder="Escribe o dicta aquí un producto (ej: '2 fainás con queso') y presiona Enter..."
                className="w-full bg-black/60 border border-white/15 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualPhraseInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow"
            >
              + Agregar Ítem
            </button>
          </form>

          {/* COMANDA ACUMULADA */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Comanda Acumulada ({cumulativeCart.length} productos)
                </span>
              </div>
              <span className="text-sm font-black font-mono text-blue-400">
                Total: ${totalCalculated}
              </span>
            </div>

            {cumulativeCart.length === 0 ? (
              <div className="py-6 text-center text-slate-500 space-y-1">
                <Mic size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-400">Sin productos cargados aún</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Habla por el micrófono para dictar el primer producto (ej. "1 metro de muzzarella con panceta"), haz una breve pausa, y luego dicta el siguiente.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {cumulativeCart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-blue-400 font-black font-mono text-sm">{item.cantidad}x</span>
                      <span className="font-semibold text-white truncate">{item.nombre}</span>
                      {item.notas && (
                        <span className="text-[10px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-500/30">
                          {item.notas}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="font-mono font-bold text-white">${item.precioUnitario * item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => setCumulativeCart(cumulativeCart.filter((_, i) => i !== idx))}
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

          {/* CLIENT DATABASE AUTOCOMPLETE & DESTINATION / PAYMENT ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* DESTINO */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Destino:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['local', 'mesa', 'envio'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDetectedPayment(prev => ({ ...prev, tipo: t as any }))}
                    className={`py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      detectedPayment.tipo === t
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* PAGO */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Pago:
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['efectivo', 'debito', 'credito', 'transferencia'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDetectedPayment(prev => ({ ...prev, metodo: m }))}
                    className={`py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                      detectedPayment.metodo === m
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {m.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>

            {/* CLIENTE DESDE BASE DE DATOS (AUTOCOMPLETE & SEARCHABLE) */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-1.5 relative" ref={clientDropdownRef}>
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                  <User size={11} className="text-blue-400" /> Cliente (Base de Datos):
                </label>
                <button
                  type="button"
                  onClick={() => setShowClientPickerModal(true)}
                  className="text-[9px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <Users size={10} /> Ver BD ({clients.length})
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={detectedClient.nombre || clientSearchQuery}
                  onChange={e => {
                    setClientSearchQuery(e.target.value);
                    setDetectedClient(prev => ({ ...prev, nombre: e.target.value }));
                    setIsClientDropdownOpen(true);
                  }}
                  onFocus={() => setIsClientDropdownOpen(true)}
                  placeholder="Escribe para buscar cliente de la BD..."
                  className="w-full bg-black/80 border border-white/15 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors font-mono"
                />

                {/* Dropdown with matching clients from database */}
                {isClientDropdownOpen && filteredDbClients.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#0d1628] border border-blue-500/40 rounded-xl shadow-2xl z-30 max-h-40 overflow-y-auto custom-scrollbar p-1">
                    <div className="text-[9px] font-mono text-blue-400 uppercase px-2 py-1 border-b border-white/10">
                      Clientes Registrados ({filteredDbClients.length}):
                    </div>
                    {filteredDbClients.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectClientFromDb(c)}
                        className="w-full text-left p-2 hover:bg-blue-600/30 rounded-lg text-xs transition-colors flex flex-col cursor-pointer"
                      >
                        <span className="font-bold text-white">{c.nombre}</span>
                        <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                          {c.telefono && <span>📞 {c.telefono}</span>}
                          {c.direccion && <span>📍 {c.direccion}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* QUICK PHRASES HELPER */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              O toca una frase rápida para agregarla al pedido:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => processIncrementalSpeech(phrase)}
                  className="text-[10px] font-mono bg-white/5 hover:bg-blue-900/40 text-slate-300 hover:text-blue-200 border border-white/10 hover:border-blue-500/40 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                >
                  + {phrase}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase cursor-pointer border border-white/10"
          >
            Cancelar
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={cumulativeCart.length === 0}
              onClick={() => handleApply(false)}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Cargar a la Comanda ({cumulativeCart.length} ítems - ${totalCalculated})</span>
            </button>
          </div>
        </div>

      </div>

      {/* SUB-MODAL: CLIENT DATABASE FULL PICKER */}
      {showClientPickerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl p-5 text-white flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
              <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-blue-400" /> Base de Datos de Clientes
              </h4>
              <button 
                onClick={() => setShowClientPickerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o dirección..."
                value={clientSearchQuery}
                onChange={e => setClientSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredDbClients.map(c => (
                <div 
                  key={c.id}
                  onClick={() => selectClientFromDb(c)}
                  className="p-3 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                >
                  <div>
                    <h5 className="font-bold text-xs text-white">{c.nombre}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">📍 {c.direccion || 'Sin dirección registrada'}</p>
                    <p className="text-[10px] text-blue-400 font-mono">📞 {c.telefono || 'Sin teléfono'}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
                    Seleccionar ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
