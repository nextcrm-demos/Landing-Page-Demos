import React, { useState } from 'react';
import { 
  Globe, Smartphone, QrCode, ShoppingBag, Plus, Minus, Check, 
  Send, ExternalLink, Sparkles, MapPin, Phone, CreditCard, DollarSign,
  Share2, Copy, CheckCircle2, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { MenuItem, CartItem, Order, OrderClient, OrderPayment } from '../types';

interface WebClientAppModuleProps {
  menuItems: MenuItem[];
  onNewWebOrder: (order: Order) => void;
}

export function WebClientAppModule({
  menuItems,
  onNewWebOrder,
}: WebClientAppModuleProps) {
  const [activeCategory, setActiveCategory] = useState('pizzas');
  const [webCart, setWebCart] = useState<CartItem[]>([
    {
      productoId: '1',
      nombre: '1 Metro Pizza Muzzarella',
      precioUnitario: 850,
      cantidad: 1,
      gustos: [
        { id: 'jamon', nombre: 'Jamón', precio: 60 },
        { id: 'morron', nombre: 'Morrones', precio: 50 },
      ],
      notas: 'Mitad Jamón y Morrones, bien doradita',
    },
    {
      productoId: '2',
      nombre: 'Fainá con Queso',
      precioUnitario: 105,
      cantidad: 2,
    },
  ]);

  const [clientName, setClientName] = useState('Mateo Silva');
  const [clientPhone, setClientPhone] = useState('099 876 543');
  const [clientAddress, setClientAddress] = useState('Bvar. Artigas 1840 apto 302');
  const [deliveryType, setDeliveryType] = useState<'envio' | 'local' | 'mesa'>('envio');
  const [mesaNum, setMesaNum] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'debito' | 'credito'>('efectivo');
  const [abonoCon, setAbonoCon] = useState('2000');
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = ['pizzas', 'fainas', 'pizzetas', 'promos', 'sandwiches', 'bebidas', 'postres'];

  const filteredItems = menuItems.filter(item => 
    item.categoria.toLowerCase() === activeCategory.toLowerCase()
  );

  const cartTotal = webCart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);

  const handleAddItem = (item: MenuItem) => {
    const existing = webCart.find(c => c.productoId === item.id);
    if (existing) {
      setWebCart(webCart.map(c => c.productoId === item.id ? { ...c, cantidad: c.cantidad + 1 } : c));
    } else {
      setWebCart([...webCart, {
        productoId: item.id,
        nombre: item.nombre,
        precioUnitario: item.precio,
        cantidad: 1,
      }]);
    }
  };

  const handleRemoveItem = (prodId: string) => {
    const existing = webCart.find(c => c.productoId === prodId);
    if (existing && existing.cantidad > 1) {
      setWebCart(webCart.map(c => c.productoId === prodId ? { ...c, cantidad: c.cantidad - 1 } : c));
    } else {
      setWebCart(webCart.filter(c => c.productoId !== prodId));
    }
  };

  const handleSendWebOrder = () => {
    if (webCart.length === 0) return;

    const newOrder: Order = {
      id: Math.floor(10000 + Math.random() * 90000).toString(),
      cliente: {
        nombre: clientName || 'Cliente Web',
        telefono: clientPhone,
        direccion: deliveryType === 'envio' ? clientAddress : '',
        mesa: deliveryType === 'mesa' ? mesaNum : '',
      },
      pago: {
        tipo: deliveryType,
        metodo: paymentMethod,
        notas: `Pedido recibido desde Web App Cliente • Paga con: $${abonoCon || 'Exacto'}`,
        programado: false,
        horaProgramada: '',
        abono: abonoCon,
        propina: '',
        cadete: 'Samuel',
      },
      cart: webCart,
      total: cartTotal,
      fecha: new Date().toLocaleDateString('es-UY'),
      horaPedido: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      estado: 'pendiente',
    };

    onNewWebOrder(newOrder);
    setOrderSentSuccess(true);
    setTimeout(() => setOrderSentSuccess(false), 3000);
  };

  const copyAppWebLink = () => {
    const link = 'https://pizzeria-demo.nextcrm.uy';
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#03060f] p-4 md:p-6 overflow-hidden flex flex-col text-slate-200 w-full h-full">
      
      {/* TOP HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a1124] border border-blue-500/20 rounded-2xl p-4 mb-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Globe size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wider uppercase">
                MÓDULO WEB & APP CLIENTES (MÓDULO 4 FULL)
              </h2>
              <span className="bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" />
                Venta Online Directa sin Comisiones
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Tus clientes piden directamente desde su celular por web o QR en mesas • Cae instantáneo en POS y Cocina KDS
            </p>
          </div>
        </div>

        {/* SHARE LINK & QR BAR */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyAppWebLink}
            className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-500/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {copiedLink ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Link Web App'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT: 2-PANEL PREVIEW (PHONE SIMULATOR + MANAGEMENT STATS) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">
        
        {/* LEFT PANEL: SMARTPHONE APP CLIENTE LIVE SIMULATOR (5 COLUMNS) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-3xl p-4 overflow-y-auto custom-scrollbar">
          
          {/* PHONE CHASSIS */}
          <div className="w-full max-w-[340px] bg-[#0d1424] border-4 border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[620px] relative text-white">
            
            {/* PHONE NOTCH / STATUS BAR */}
            <div className="bg-black px-6 py-2 flex justify-between items-center text-[10px] font-mono text-slate-400 shrink-0">
              <span>20:55</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto"></div>
              <span>100% 🔋</span>
            </div>

            {/* APP HEADER */}
            <div className="bg-[#111c33] p-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div>
                <h4 className="font-black text-xs text-white uppercase tracking-wider">
                  🍕 Pizzería Gourmet
                </h4>
                <p className="text-[10px] text-emerald-400 font-mono">Abierto Ahora • Envíos 30-45m</p>
              </div>
              <span className="text-[10px] bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                App Web
              </span>
            </div>

            {/* CATEGORIES PILLS */}
            <div className="flex gap-1.5 p-2 bg-black/40 overflow-x-auto hide-scrollbar shrink-0">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap cursor-pointer ${
                    activeCategory === c
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* PRODUCTS LIST */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
              {filteredItems.map(item => {
                const inCart = webCart.find(c => c.productoId === item.id);
                return (
                  <div 
                    key={item.id} 
                    className="bg-[#131f38] border border-white/10 rounded-xl p-2 flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{item.nombre}</p>
                      <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">{item.descripcion}</p>
                      <p className="text-xs font-mono font-bold text-emerald-400 mt-1">${item.precio}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {inCart ? (
                        <div className="flex items-center gap-1 bg-purple-950 border border-purple-500/40 rounded-lg p-0.5">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-5 h-5 bg-purple-800 rounded flex items-center justify-center text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold px-1">{inCart.cantidad}</span>
                          <button
                            onClick={() => handleAddItem(item)}
                            className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg uppercase cursor-pointer"
                        >
                          + Pedir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FLOATING CART FOOTER */}
            {webCart.length > 0 && (
              <div className="bg-black/90 p-3 border-t border-purple-500/30 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {webCart.reduce((s, it) => s + it.cantidad, 0)} ítems en carrito
                  </span>
                  <span className="font-black text-sm text-emerald-400 font-mono">${cartTotal}</span>
                </div>
                
                <button
                  onClick={handleSendWebOrder}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] px-3.5 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Send size={12} /> Confirmar Pedido
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: ORDER CONFIGURATION & INSTANT TEST TRANSMISSION (7 COLUMNS) */}
        <div className="lg:col-span-7 bg-[#0a1124] border border-blue-500/20 rounded-3xl p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-xl">
          
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={18} className="text-purple-400" /> Simulador de Pedido Web del Cliente
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Modifica los datos del cliente y presiona "Simular Envío de Pedido Web" para ver cómo cae automáticamente en tu POS y KDS.
              </p>
            </div>

            {orderSentSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>¡Pedido Web recibido con éxito! Se cargó en la Comanda KDS y en el POS en tiempo real.</span>
              </div>
            )}

            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Nombre del Cliente Web:
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Tipo de Entrega:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'envio', label: '🛵 Delivery' },
                    { id: 'local', label: '📦 Retiro' },
                    { id: 'mesa', label: '🍽️ Mesa QR' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDeliveryType(t.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        deliveryType === t.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-black/40 text-slate-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  {deliveryType === 'mesa' ? 'Número de Mesa:' : 'Dirección de Entrega:'}
                </label>
                {deliveryType === 'mesa' ? (
                  <input
                    type="text"
                    placeholder="Mesa 5"
                    value={mesaNum}
                    onChange={(e) => setMesaNum(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                )}
              </div>
            </div>

            {/* PAYMENT & CHANGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Medio de Pago Seleccionado por el Cliente:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                >
                  <option value="efectivo">Efectivo al recibir</option>
                  <option value="debito">POS Tarjeta Débito</option>
                  <option value="credito">POS Tarjeta Crédito</option>
                  <option value="transferencia">Transferencia Bancaria / QR</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Paga con / Cambio Requerido:
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2000"
                  value={abonoCon}
                  onChange={(e) => setAbonoCon(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* SUMMARY BOX */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Total Comanda Web:</span>
                <span className="text-emerald-400 font-bold text-sm">${cartTotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cambio a preparar para cadete:</span>
                <span className="text-white font-bold">
                  {Number(abonoCon) > cartTotal ? `$${Number(abonoCon) - cartTotal}` : '$0'}
                </span>
              </div>
            </div>
          </div>

          {/* BIG TRANSMIT BUTTON */}
          <button
            type="button"
            onClick={handleSendWebOrder}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black py-4 px-6 rounded-2xl uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(147,51,234,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Zap size={16} /> Simular Envío de Pedido Web a Cocina & POS
          </button>

        </div>

      </div>

    </div>
  );
}
