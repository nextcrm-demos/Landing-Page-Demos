import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Phone, User, MapPin, Check, CheckCheck, 
  Sparkles, Plus, ExternalLink, QrCode, Search, RefreshCw, 
  ShoppingBag, CheckCircle, AlertCircle, Clock, Trash2, ArrowRight,
  Flame, ShieldCheck, Settings, Users
} from 'lucide-react';
import { WhatsAppChat, WhatsAppMessage, MenuItem, Client, Order } from '../types';
import { parseOrderLocally, parseOrderWithAI, ParsedOrderResult } from '../utils/aiOrderParser';
import { defaultClients } from '../data/defaults';

interface WhatsAppInboxModuleProps {
  menuItems: MenuItem[];
  clients: Client[];
  onApplyParsedOrder: (result: ParsedOrderResult, directConfirm?: boolean) => void;
  onSaveNewClient?: (client: { nombre: string; telefono: string; direccion: string }) => void;
}

export function WhatsAppInboxModule({
  menuItems,
  clients,
  onApplyParsedOrder,
  onSaveNewClient,
}: WhatsAppInboxModuleProps) {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState<Record<string, boolean>>({});
  const [extractedOrders, setExtractedOrders] = useState<Record<string, ParsedOrderResult>>({});

  // Simulation form
  const [simName, setSimName] = useState('Adrian Gil');
  const [simPhone, setSimPhone] = useState('098762242');
  const [simText, setSimText] = useState('Hola! Quiero pedir 1 metro de muzzarella con panceta y aceitunas, y 2 fainás para mandar a Barrio Sur');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch chats on mount and interval
  const fetchChats = async () => {
    try {
      const res = await fetch('/api/whatsapp/chats');
      if (res.ok) {
        const data = await res.json();
        if (data.chats && data.chats.length > 0) {
          setChats(data.chats);
          if (!activeChatId) {
            setActiveChatId(data.chats[0].id);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching whatsapp chats:', e);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Extract order with AI when viewing a message
  const extractOrderFromMessage = async (msg: WhatsAppMessage) => {
    if (extractedOrders[msg.id]) return;

    setIsProcessingAI(prev => ({ ...prev, [msg.id]: true }));
    try {
      const parsed = parseOrderLocally(msg.text, menuItems);
      
      // Match client from DB by phone or name
      const matchedClient = clients.find(c => 
        (c.telefono && msg.senderPhone && (c.telefono.includes(msg.senderPhone) || msg.senderPhone.includes(c.telefono))) ||
        (c.nombre && msg.senderName && c.nombre.toUpperCase().includes(msg.senderName.toUpperCase()))
      );

      if (matchedClient) {
        parsed.cliente = {
          nombre: matchedClient.nombre,
          telefono: matchedClient.telefono,
          direccion: matchedClient.direccion,
          mesa: '',
        };
        if (matchedClient.direccion) {
          parsed.pago.tipo = 'envio';
        }
      } else {
        if (!parsed.cliente.nombre) parsed.cliente.nombre = msg.senderName;
        if (!parsed.cliente.telefono) parsed.cliente.telefono = msg.senderPhone;
      }

      setExtractedOrders(prev => ({ ...prev, [msg.id]: parsed }));
    } catch (err) {
      console.warn('Error parsing whatsapp order:', err);
    } finally {
      setIsProcessingAI(prev => ({ ...prev, [msg.id]: false }));
    }
  };

  // Auto extract for latest incoming message
  useEffect(() => {
    if (activeChat?.messages) {
      const incomingMsgs = activeChat.messages.filter(m => !m.fromMe);
      const lastIncoming = incomingMsgs[incomingMsgs.length - 1];
      if (lastIncoming && !extractedOrders[lastIncoming.id]) {
        extractOrderFromMessage(lastIncoming);
      }
    }
  }, [activeChatId, activeChat?.messages?.length]);

  const handleSendReply = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || replyInput.trim();
    if (!textToSend || !activeChat) return;

    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChat.id, text: textToSend }),
      });
      setReplyInput('');
      fetchChats();
    } catch (err) {
      console.warn('Error sending whatsapp reply:', err);
    }
  };

  const handleSimulateIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: simName,
          phone: simPhone,
          text: simText,
        }),
      });
      setShowSimulateModal(false);
      fetchChats();
    } catch (err) {
      console.warn('Error simulating incoming message:', err);
    }
  };

  const filteredChats = chats.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.contactName.toLowerCase().includes(q) || 
           c.phone.includes(q) || 
           c.lastMessage.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 bg-[#050505] p-4 flex gap-4 overflow-hidden relative font-sans text-white">
      
      {/* LEFT SIDEBAR: CHAT LIST & CONNECTION STATUS */}
      <div className="w-[320px] sm:w-[360px] bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl shrink-0">
        
        {/* CONNECTION STATUS & TOP ACTIONS */}
        <div className="p-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold text-white tracking-wide">WhatsApp Conectado</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg text-[10px] font-bold border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Simular un mensaje entrante de prueba"
            >
              <Plus size={11} /> Simular
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs border border-white/10 transition-all cursor-pointer"
              title="Configurar Webhook y código QR"
            >
              <QrCode size={14} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-2.5 bg-black/40 border-b border-white/10">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/70 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* CONVERSATION LIST */}
        <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <MessageSquare size={24} className="mx-auto text-slate-600 mb-2" />
              <span>Sin conversaciones de WhatsApp</span>
            </div>
          ) : (
            filteredChats.map(c => {
              const isSelected = c.id === activeChatId;
              const hasOrderUnprocessed = c.messages.some(m => !m.fromMe && !m.parsedOrder);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveChatId(c.id);
                    c.unreadCount = 0;
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border flex gap-3 items-start ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-lg' 
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-base shrink-0">
                    {c.avatar || '🍕'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-xs text-white truncate">{c.contactName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate leading-tight mb-1">
                      {c.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500">📞 {c.phone}</span>
                      {c.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                          {c.unreadCount} nuevo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: ACTIVE CONVERSATION + AI ORDER EXTRACTION */}
      <div className="flex-1 bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        
        {activeChat ? (
          <>
            {/* CHAT HEADER WITH CUSTOMER INFO & DB MATCH */}
            <div className="p-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-lg">
                  {activeChat.avatar || '👨‍💼'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{activeChat.contactName}</h3>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {activeChat.phone}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Canal: WhatsApp Oficial (098 356 320)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/598${activeChat.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/40 transition-all flex items-center gap-1.5"
                >
                  <ExternalLink size={13} /> Abrir en WhatsApp Web
                </a>
              </div>
            </div>

            {/* MESSAGE THREAD + AI ORDER EXTRACTION CARDS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {activeChat.messages.map((msg, idx) => {
                const isAIOrderAvailable = extractedOrders[msg.id] && extractedOrders[msg.id].cart.length > 0;
                const orderData = extractedOrders[msg.id];
                const totalOrder = orderData?.cart.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0) || 0;

                return (
                  <div key={msg.id || idx} className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'} space-y-1.5`}>
                    
                    {/* BUBBLE */}
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs shadow-md ${
                      msg.fromMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-[#121c30] text-slate-200 border border-white/10 rounded-bl-none'
                    }`}>
                      <div className="flex justify-between items-center gap-4 mb-1">
                        <span className="font-bold text-[10px] text-blue-300">{msg.senderName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* AI DETECTED ORDER BANNER (IF MESSAGE CONTAINS FOOD ITEMS) */}
                    {!msg.fromMe && (
                      <div className="w-full max-w-lg bg-[#070e1d] border border-blue-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-xl animate-in fade-in duration-200">
                        <div className="flex justify-between items-center border-b border-blue-500/20 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                            <Sparkles size={14} className="text-blue-400" />
                            <span>IA: Pedido Extraído del Mensaje</span>
                          </div>
                          {isProcessingAI[msg.id] ? (
                            <span className="text-[10px] text-blue-400 font-mono animate-pulse">Analizando...</span>
                          ) : (
                            <span className="text-xs font-black font-mono text-white">Total: ${totalOrder}</span>
                          )}
                        </div>

                        {orderData && orderData.cart.length > 0 ? (
                          <>
                            <div className="space-y-1.5">
                              {orderData.cart.map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-black/50 p-2 rounded-lg text-xs">
                                  <div className="truncate">
                                    <strong className="text-blue-400 font-mono">{item.cantidad}x</strong> {item.nombre}
                                    {item.notas && <span className="text-[10px] text-blue-300 ml-1">({item.notas})</span>}
                                  </div>
                                  <span className="font-mono font-bold text-white">${item.precioUnitario * item.cantidad}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 bg-black/30 p-2 rounded-lg">
                              <span>📍 Cliente: <strong>{orderData.cliente.nombre || activeChat.contactName}</strong></span>
                              <span>Destino: <strong>{orderData.pago.tipo.toUpperCase()}</strong></span>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onApplyParsedOrder(orderData, false);
                                  handleSendReply(undefined, `¡Hola ${orderData.cliente.nombre || ''}! Recibimos tu pedido de ${orderData.cart.map(i => `${i.cantidad} ${i.nombre}`).join(', ')}. Total: $${totalOrder}. Ya lo estamos preparando 🔥`);
                                }}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all border border-white/15 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <ShoppingBag size={13} /> Cargar en POS
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onApplyParsedOrder(orderData, true);
                                  handleSendReply(undefined, `¡Pedido confirmado #${Date.now().toString().slice(-4)}! Tu comanda ya está en el horno. Demora aprox 30-35 min 🍕`);
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Flame size={13} /> Enviar Directo a Cocina
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-[11px] text-slate-400">
                            <span>Mensaje de consulta o saludo</span>
                            <button
                              type="button"
                              onClick={() => extractOrderFromMessage(msg)}
                              className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                            >
                              Re-analizar con IA
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK REPLY CHIPS */}
            <div className="px-4 py-2 bg-black/40 border-t border-white/10 flex gap-2 overflow-x-auto custom-scrollbar">
              {[
                '¡Hola! Tu pedido ya está en preparación en el horno 🔥',
                'Demora estimada: 30 a 35 minutos 🛵',
                '¿Abonas con efectivo o tarjeta en el domicilio?',
                '¡Pedido en camino con el cadete! Gracias por elegirnos 🍕'
              ].map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendReply(undefined, chip)}
                  className="text-[10px] bg-white/5 hover:bg-blue-600/30 text-slate-300 hover:text-blue-200 border border-white/10 px-2.5 py-1 rounded-xl whitespace-nowrap transition-colors cursor-pointer"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* MESSAGE INPUT BAR */}
            <form onSubmit={handleSendReply} className="p-3.5 bg-black/60 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={replyInput}
                onChange={e => setReplyInput(e.target.value)}
                placeholder="Escribe una respuesta para WhatsApp..."
                className="flex-1 bg-black/80 border border-white/15 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!replyInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <MessageSquare size={36} className="text-slate-600 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider">Selecciona una conversación</p>
          </div>
        )}

      </div>

      {/* MODAL: QR CODE & WEBHOOK CONFIG */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-md shadow-2xl p-6 text-white text-center">
            <h3 className="font-bold text-base uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
              <QrCode size={18} className="text-blue-400" /> Vinculación de WhatsApp
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Escanea con tu WhatsApp para recibir todos los pedidos en este CRM
            </p>

            {/* QR CODE MOCKUP */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl border-4 border-blue-500/40">
              <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white p-3 font-mono text-[10px] text-center">
                <QrCode size={64} className="text-blue-400 mb-2" />
                <span className="font-bold text-white">ESCANEAR CÓDIGO</span>
                <span className="text-[8px] text-slate-400">WhatsApp &gt; Dispositivos vinculados</span>
              </div>
            </div>

            <div className="bg-black/60 border border-white/10 p-3 rounded-xl text-left text-[11px] text-slate-300 space-y-1.5 mb-4">
              <div>
                <span className="text-[10px] text-blue-400 font-mono uppercase block">URL de Webhook:</span>
                <code className="text-[10px] text-white font-mono bg-white/5 px-2 py-0.5 rounded block truncate">
                  https://nextcrm-demo-pizzeria.vercel.app/api/whatsapp/webhook
                </code>
              </div>
              <div>
                <span className="text-[10px] text-blue-400 font-mono uppercase block">Token de Verificación:</span>
                <code className="text-[10px] text-emerald-400 font-mono bg-white/5 px-2 py-0.5 rounded block">
                  NEXTCRM_WHATSAPP_TOKEN
                </code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer"
            >
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SIMULAR MENSAJE ENTRANTE */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-md shadow-2xl p-6 text-white">
            <h3 className="font-bold text-base uppercase tracking-wider mb-1 flex items-center gap-2">
              <Plus size={18} className="text-blue-400" /> Simular Mensaje Entrante
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Prueba cómo la IA recibe el mensaje y lo convierte a comanda en vivo
            </p>

            <form onSubmit={handleSimulateIncoming} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Nombre del Cliente:</label>
                <input
                  type="text"
                  value={simName}
                  onChange={e => setSimName(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Teléfono:</label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={e => setSimPhone(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Mensaje de Pedido:</label>
                <textarea
                  value={simText}
                  onChange={e => setSimText(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-500 resize-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase shadow-md cursor-pointer"
                >
                  Simular Llegada ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
