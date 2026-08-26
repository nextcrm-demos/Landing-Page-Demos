import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Sparkles, X, CheckCircle, 
  ArrowRight, RefreshCw, AlertCircle, ShoppingBag, 
  User, MapPin, Phone, CreditCard, DollarSign, UtensilsCrossed,
  Volume2, VolumeX, ChevronDown, ChevronUp, GripVertical, Check, Plus, Trash2,
  Play, Pause, Square, Radio, MessageSquare, Headphones, Sliders, ShieldAlert,
  RotateCcw, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment } from '../types';
import { parseOrderWithAI, parseOrderLocally, ParsedOrderResult } from '../utils/aiOrderParser';
import { gustosAdicionales } from '../data/defaults';

interface AIOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
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

  // Audio Wave & Sound
  const [audioLevel, setAudioLevel] = useState(0);
  const [autoSpeakConfirm, setAutoSpeakConfirm] = useState(true);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const pauseTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const isListeningRef = useRef<boolean>(false);

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

  // Request Mic Permission & Initialize
  const checkAndRequestMicrophone = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setMicPermissionState('unsupported');
      setSpeechError('Tu navegador no soporta reconocimiento de voz nativo. Puedes usar el modo texto/WhatsApp.');
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
      recognition.lang = 'es-UY';
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

          // When speech pauses for 1000ms, process this specific chunk and accumulate
          pauseTimerRef.current = setTimeout(() => {
            processIncrementalSpeech(speechText);
          }, 1000);
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
      // If there is speech in progress, process it before pausing
      if (currentSpeechChunk.trim()) {
        processIncrementalSpeech(currentSpeechChunk);
      }
      stopVoiceRecognition();
    } else {
      checkAndRequestMicrophone();
    }
  };

  // Process incremental spoken product or metadata
  const processIncrementalSpeech = async (text: string) => {
    if (!text || text.trim().length === 0) return;
    setIsProcessing(true);

    try {
      const parsed = await parseOrderWithAI(text, menuItems, gustosAdicionales);

      // Merge items incrementally into cumulative cart
      if (parsed.cart.length > 0) {
        setCumulativeCart(prevCart => {
          const updated = [...prevCart];
          parsed.cart.forEach(newItem => {
            const existingIdx = updated.findIndex(u => u.id === newItem.id && u.notas === newItem.notas);
            if (existingIdx >= 0) {
              updated[existingIdx].cantidad += newItem.cantidad;
            } else {
              updated.push(newItem);
            }
          });
          return updated;
        });
      }

      // Update client metadata if found
      if (parsed.cliente.nombre) setDetectedClient(prev => ({ ...prev, nombre: parsed.cliente.nombre }));
      if (parsed.cliente.mesa) setDetectedClient(prev => ({ ...prev, mesa: parsed.cliente.mesa }));
      if (parsed.cliente.telefono) setDetectedClient(prev => ({ ...prev, telefono: parsed.cliente.telefono }));
      if (parsed.cliente.direccion) setDetectedClient(prev => ({ ...prev, direccion: parsed.cliente.direccion }));

      // Update payment metadata if detected
      if (parsed.pago.tipo && parsed.pago.tipo !== 'local') setDetectedPayment(prev => ({ ...prev, tipo: parsed.pago.tipo }));
      if (parsed.pago.metodo && parsed.pago.metodo !== 'efectivo') setDetectedPayment(prev => ({ ...prev, metodo: parsed.pago.metodo }));
      if (parsed.pago.abono) setDetectedPayment(prev => ({ ...prev, abono: parsed.pago.abono }));

      // Add to spoken history
      setHistoryTranscript(prev => [text, ...prev.slice(0, 4)]);
      setCurrentSpeechChunk('');

      // Audio confirmation
      if (autoSpeakConfirm && parsed.cart.length > 0) {
        const addedItems = parsed.cart.map(c => `${c.cantidad} ${c.nombre}`).join(', ');
        speakOrderSummary(`Agregado: ${addedItems}`);
      }
    } catch (err) {
      console.warn('Error processing incremental chunk:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Modify cumulative item quantity
  const updateItemQty = (index: number, delta: number) => {
    setCumulativeCart(prev => {
      const updated = [...prev];
      updated[index].cantidad += delta;
      if (updated[index].cantidad <= 0) {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  // Remove single item
  const removeItem = (index: number) => {
    setCumulativeCart(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const clearAll = () => {
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
    setCurrentSpeechChunk('');
    setHistoryTranscript([]);
  };

  // Total
  const totalCalculated = cumulativeCart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  const totalItemsCount = cumulativeCart.reduce((sum, item) => sum + item.cantidad, 0);

  // Apply to order in POS
  const handleApplyOrder = () => {
    if (cumulativeCart.length === 0) return;
    const finalResult: ParsedOrderResult = {
      cart: cumulativeCart,
      cliente: detectedClient,
      pago: detectedPayment,
      resumen: `Pedido de ${totalItemsCount} productos (${detectedPayment.tipo.toUpperCase()})`,
      source: 'gemini',
      rawText: historyTranscript.join(' | '),
    };
    onApplyToOrder(finalResult, false);
    onClose();
  };

  if (!isOpen) return null;

  // Minimized Widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[120] animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3.5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/40 font-bold text-sm tracking-wider cursor-pointer"
        >
          <Mic size={18} className="animate-pulse text-emerald-200" />
          <span>PEDIDO POR VOZ ({totalItemsCount})</span>
          <ChevronUp size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        id="ai-voice-floating-modal"
        className="w-full max-w-2xl bg-[#040e0a]/98 border border-emerald-500/40 rounded-3xl shadow-[0_0_60px_rgba(5,150,105,0.35)] flex flex-col overflow-hidden text-slate-100 max-h-[94vh] backdrop-blur-2xl"
      >
        {/* HEADER */}
        <div className="bg-[#020705] border-b border-emerald-500/20 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Mic size={16} className={isListening ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black text-sm tracking-wider">
                  PEDIDOS POR VOZ & DICTADO DIRECTO
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  MULTI-PRODUCTO
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Dicta producto por producto pausando el micrófono entre cada uno</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextVal = !autoSpeakConfirm;
                setAutoSpeakConfirm(nextVal);
                if (!nextVal) stopTTS();
              }}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                autoSpeakConfirm 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
              title={autoSpeakConfirm ? 'Confirmación hablada activada' : 'Confirmación hablada silenciada'}
            >
              {autoSpeakConfirm ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} />}
              <span className="hidden sm:inline text-[10px]">Voz</span>
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Minimizar"
            >
              <ChevronDown size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTROLES PRINCIPALES DE DICTADO Y MICRÓFONO */}
        <div className="p-4 bg-[#030a07] border-b border-emerald-500/20 space-y-3">
          
          {/* Permission Block Banner */}
          {micPermissionState === 'denied' && (
            <div className="bg-amber-950/60 border border-amber-500/50 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white">Micrófono no autorizado en el navegador</p>
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  Para habilitar el micrófono, haz clic en el <strong>icono del candado o cámara</strong> al lado de <code>localhost:3000</code> en la barra superior de tu navegador y activa <strong>"Permitir micrófono"</strong>. Luego haz clic en el botón de reintentar.
                </p>
                <button
                  type="button"
                  onClick={checkAndRequestMicrophone}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer mt-1 inline-flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Reintentar Acceso al Micrófono
                </button>
              </div>
            </div>
          )}

          {/* Large Interactive Mic Control & Live Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Direct Mic Action Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`col-span-1 sm:col-span-2 p-3.5 rounded-2xl flex items-center justify-between gap-3 font-bold text-sm transition-all cursor-pointer border shadow-lg ${
                isListening
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isListening ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
                </div>
                <div className="text-left">
                  <span className="block text-xs uppercase tracking-wider font-mono">
                    {isListening ? 'ESCUCHANDO EN VIVO...' : 'MICRÓFONO EN PAUSA'}
                  </span>
                  <span className="text-[11px] font-normal opacity-80">
                    {isListening ? 'Toca para pausar entre productos' : 'Toca para hablar o dictar un producto'}
                  </span>
                </div>
              </div>

              {/* Dynamic Live Audio Equalizer Wave */}
              <div className="flex items-center gap-1 h-6 bg-black/40 px-2 py-1 rounded-lg border border-white/10 shrink-0">
                {[0.4, 0.9, 1.3, 0.7, 1.1, 0.5, 1.2, 0.8].map((mult, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isListening ? 'bg-emerald-400' : 'bg-slate-700'
                    }`}
                    style={{ height: `${isListening ? Math.min(100, Math.max(15, audioLevel * mult)) : 10}%` }}
                  ></div>
                ))}
              </div>
            </button>

            {/* Quick Actions / Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                disabled={cumulativeCart.length === 0 && !currentSpeechChunk}
                className="flex-1 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Limpiar comanda actual"
              >
                <RotateCcw size={14} />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Current Spoken Chunk / Live Transcript */}
          {currentSpeechChunk && (
            <div className="p-2.5 bg-black/60 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                <span className="text-emerald-300 italic truncate">"{currentSpeechChunk}"</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">Pausa para agregar...</span>
            </div>
          )}
        </div>

        {/* BODY: ACCUMULATED PRODUCTS & METADATA */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {/* PRODUCTOS ACUMULADOS EN TIEMPO REAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <ShoppingBag size={15} className="text-emerald-400" />
                <span>Comanda Acumulada ({totalItemsCount} productos)</span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 mr-2">Total Acumulado:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">${totalCalculated}</span>
              </div>
            </div>

            {cumulativeCart.length > 0 ? (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {cumulativeCart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-black/60 border border-emerald-500/20 hover:border-emerald-500/40 p-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateItemQty(idx, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-emerald-400">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQty(idx, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="truncate">
                        <p className="font-bold text-sm text-slate-100 truncate">{item.nombre}</p>
                        {item.notas && (
                          <p className="text-[11px] text-emerald-400 truncate">{item.notas}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-sm text-emerald-300">
                        ${item.precioUnitario * item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 bg-black/40 rounded-2xl border border-dashed border-emerald-500/20 text-center space-y-2 p-4">
                <Mic size={28} className="mx-auto text-emerald-500/60 animate-pulse" />
                <p className="text-xs font-bold text-slate-300">Sin productos cargados aún</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Habla por el micrófono para dictar el primer producto (ej. <em>"1 metro de muzzarella con panceta"</em>), haz una breve pausa, y luego dicta el siguiente.
                </p>
              </div>
            )}
          </div>

          {/* METADATOS DETECTADOS (DESTINO, PAGO, CLIENTE) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Destino */}
            <div className="bg-black/50 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Destino:</span>
              <div className="flex gap-1">
                {(['local', 'mesa', 'envio'] as const).map(tipo => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setDetectedPayment(p => ({ ...p, tipo }))}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      detectedPayment.tipo === tipo
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            {/* Pago */}
            <div className="bg-black/50 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Pago:</span>
              <div className="flex gap-1">
                {(['efectivo', 'debito', 'credito', 'transferencia'] as const).map(metodo => (
                  <button
                    key={metodo}
                    type="button"
                    onClick={() => setDetectedPayment(p => ({ ...p, metodo }))}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      detectedPayment.metodo === metodo
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {metodo === 'transferencia' ? 'Transf' : metodo}
                  </button>
                ))}
              </div>
            </div>

            {/* Cliente o Mesa */}
            <div className="bg-black/50 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                {detectedPayment.tipo === 'mesa' ? 'Mesa:' : detectedPayment.tipo === 'envio' ? 'Dirección:' : 'Cliente:'}
              </span>
              <input
                type="text"
                value={
                  detectedPayment.tipo === 'mesa'
                    ? detectedClient.mesa
                    : detectedPayment.tipo === 'envio'
                    ? detectedClient.direccion
                    : detectedClient.nombre
                }
                onChange={e => {
                  const val = e.target.value;
                  if (detectedPayment.tipo === 'mesa') setDetectedClient(c => ({ ...c, mesa: val }));
                  else if (detectedPayment.tipo === 'envio') setDetectedClient(c => ({ ...c, direccion: val }));
                  else setDetectedClient(c => ({ ...c, nombre: val }));
                }}
                placeholder={detectedPayment.tipo === 'mesa' ? 'Nº de Mesa (ej: 4)' : detectedPayment.tipo === 'envio' ? 'Calle y número' : 'Nombre del cliente'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-emerald-300 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          {/* EJEMPLOS RÁPIDOS PARA AGREGAR PRODUCTOS */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">
              O toca una frase rápida para agregarla al pedido:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PHRASES.map((phrase, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => processIncrementalSpeech(phrase)}
                  className="bg-black/40 hover:bg-emerald-950/60 border border-emerald-500/20 hover:border-emerald-500/40 px-2.5 py-1 rounded-lg text-[11px] text-slate-300 hover:text-emerald-200 transition-all cursor-pointer"
                >
                  + {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-[#020705] border-t border-emerald-500/20 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
          >
            CANCELAR
          </button>

          <button
            type="button"
            onClick={handleApplyOrder}
            disabled={cumulativeCart.length === 0}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>CARGAR A LA COMANDA ({totalItemsCount} ÍTEMS - ${totalCalculated})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
