import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, Trash2, X, ArrowRight, CheckCircle2, 
  MessageSquare, Printer, Package, Search, ShoppingCart, 
  Truck, Store, Utensils, DollarSign, CreditCard, Clock, MapPin, Sparkles, AlertCircle,
  ChefHat, RefreshCw, Download, Mail, UserPlus, Check, ShoppingBag, Eye, Send
} from 'lucide-react';
import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Order } from '../../types';
import { gustosAdicionales } from '../../data/defaults';
import { saveOrder } from '../../lib/firebase';

interface ClientOrderModuleProps {
  selectedProduct: MenuItem | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<MenuItem | null>>;
  posStep: number;
  setPosStep: (step: number) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  menuItems: MenuItem[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: MenuItem, cant?: number, selectedGustos?: Gusto[], notas?: string) => void;
  currentOrderClient: OrderClient;
  setCurrentOrderClient: React.Dispatch<React.SetStateAction<OrderClient>>;
  currentOrderPayment: OrderPayment;
  setCurrentOrderPayment: React.Dispatch<React.SetStateAction<OrderPayment>>;
  formErrors: Record<string, string>;
  validateClientData: () => boolean;
  handleConfirmPedidoFinal: () => void;
  lastConfirmedOrder: Order | null;
  handleNewOrder: () => void;
  onGoToTracking: () => void;
}

export function ClientOrderModule({
  selectedProduct,
  setSelectedProduct,
  posStep,
  setPosStep,
  activeCategory,
  setActiveCategory,
  menuItems,
  cart,
  setCart,
  addToCart,
  currentOrderClient,
  setCurrentOrderClient,
  currentOrderPayment,
  setCurrentOrderPayment,
  formErrors,
  validateClientData,
  handleConfirmPedidoFinal,
  lastConfirmedOrder,
  handleNewOrder,
  onGoToTracking,
}: ClientOrderModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [selectedGustos, setSelectedGustos] = useState<Gusto[]>([]);
  const [gustosNotes, setGustosNotes] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  // Categories
  const categories = [
    { id: 'todas', name: 'Todo el Menú', emoji: '🍽️' },
    { id: 'promos', name: 'Promos', emoji: '🔥' },
    { id: 'pizzas', name: 'Pizzas por Metro', emoji: '🍕' },
    { id: 'pizzetas', name: 'Pizzetas', emoji: '🫓' },
    { id: 'fainas', name: 'Fainás', emoji: '🧈' },
    { id: 'sandwiches', name: 'Sándwiches', emoji: '🥪' },
    { id: 'bebidas', name: 'Bebidas', emoji: '🥤' },
    { id: 'postres', name: 'Postres', emoji: '🍰' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'todas' || item.categoria.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleOpenProductCustomizer = (product: MenuItem) => {
    setSelectedProduct(product);
    setSelectedGustos([]);
    setGustosNotes('');
    setProductQuantity(1);
  };

  const handleToggleGusto = (gusto: Gusto) => {
    const exists = selectedGustos.find(g => g.id === gusto.id);
    if (exists) {
      setSelectedGustos(selectedGustos.filter(g => g.id !== gusto.id));
    } else {
      setSelectedGustos([...selectedGustos, gusto]);
    }
  };

  const handleConfirmAddProduct = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, productQuantity, selectedGustos, gustosNotes);
    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleUpdateCartItemQty = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].cantidad + delta;
    if (newQty <= 0) {
      handleRemoveFromCart(index);
    } else {
      updated[index].cantidad = newQty;
      setCart(updated);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#040814] relative font-sans text-slate-100">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* MODAL GUSTOS Y PERSONALIZACIÓN */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0a0f1c] border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
            
            {/* MODAL HEADER */}
            <div className="bg-[#0e1629] p-5 flex justify-between items-center border-b border-white/10 shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Personalizar Producto
                </span>
                <h3 className="font-black text-lg text-white mt-1">{selectedProduct.nombre}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Precio base: <strong className="text-emerald-400 font-bold">${selectedProduct.precio}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <X size={18}/>
              </button>
            </div>

            {/* GUSTOS LIST */}
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Selecciona Gustos e Ingredientes Extra:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {gustosAdicionales.map(gusto => {
                    const isSelected = selectedGustos.some(g => g.id === gusto.id);
                    return (
                      <button
                        key={gusto.id}
                        type="button"
                        onClick={() => handleToggleGusto(gusto)}
                        className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                            : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <span className="font-bold">{gusto.nombre}</span>
                        <span className="text-[10px] font-mono opacity-80 mt-1">
                          {gusto.precio > 0 ? `+$${gusto.precio}` : 'Incluido'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Aclaraciones o Notas para la Cocina:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Mitad Jamón y mitad Panceta, bien doradita..."
                  value={gustosNotes}
                  onChange={(e) => setGustosNotes(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
                />
              </div>

              {/* QUANTITY */}
              <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-slate-300 uppercase">Cantidad:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base px-2">{productQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-bold text-sm text-white cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-[#0e1629] border-t border-white/10 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Subtotal</span>
                <span className="font-black text-lg text-emerald-400 font-mono">
                  ${(selectedProduct.precio + selectedGustos.reduce((s, g) => s + g.precio, 0)) * productQuantity}
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleConfirmAddProduct}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus size={15} /> Agregar al Carrito
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MAIN LEFT COLUMN: MENU BROWSER (8 COLUMNS) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-5 min-w-0">
        
        {/* TOP SEARCH & CATEGORIES BAR */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar en la carta de pizzas, fainás, bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f1c] border border-white/10 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-500 outline-none shadow-md font-mono"
            />
          </div>

          {/* CATEGORY CHIPS */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#0a0f1c] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredMenuItems.map(item => (
              <div
                key={item.id}
                className="bg-[#0a0f1c] border border-white/10 hover:border-blue-500/40 rounded-3xl p-4 flex flex-col justify-between shadow-lg transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                      {item.nombre}
                    </h4>
                    <span className="font-mono font-black text-sm text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      ${item.precio}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.descripcion}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {item.categoria}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenProductCustomizer(item)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1"
                  >
                    <Plus size={13} /> Pedir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: LIVE CART & CHECKOUT STEPPER (4 COLUMNS / DESKTOP SIDEBAR) */}
      <div className="w-full lg:w-96 bg-[#080d1a] border-l border-white/10 flex flex-col justify-between p-5 overflow-y-auto custom-scrollbar shrink-0">
        
        {/* SIDEBAR HEADER */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-400" />
              Tu Pedido ({cartItemsCount})
            </span>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[10px] text-red-400 hover:underline font-mono cursor-pointer"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* CART ITEMS LIST */}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-600">
                <ShoppingCart size={20} />
              </div>
              <p className="text-xs">El carrito está vacío</p>
              <p className="text-[10px] text-slate-600">Elige productos del menú para ordenar</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[35vh] overflow-y-auto custom-scrollbar pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-3 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-xs text-white leading-tight">{item.nombre}</p>
                      {item.notas && (
                        <p className="text-[10px] text-amber-300 font-mono leading-tight mt-0.5">
                          + {item.notas}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      ${item.precioUnitario * item.cantidad}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 bg-black/40 rounded-lg p-0.5">
                      <button
                        onClick={() => handleUpdateCartItemQty(idx, -1)}
                        className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-xs font-bold hover:bg-white/20 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1 font-mono">{item.cantidad}</span>
                      <button
                        onClick={() => handleUpdateCartItemQty(idx, 1)}
                        className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(idx)}
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

        {/* CHECKOUT / CLIENT DATA & CONFIRMATION */}
        {cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            
            {/* DELIVERY TYPE SELECTOR */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                Modalidad de Entrega:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'envio', label: '🛵 Delivery' },
                  { id: 'local', label: '📦 Retiro' },
                  { id: 'mesa', label: '🍽️ Mesa' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCurrentOrderPayment({ ...currentOrderPayment, tipo: t.id as any })}
                    className={`py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
                      currentOrderPayment.tipo === t.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-black/40 text-slate-400 border border-white/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CLIENT INPUTS */}
            <div className="space-y-2 text-xs">
              <input
                type="text"
                placeholder="Tu Nombre Completo *"
                value={currentOrderClient.nombre}
                onChange={(e) => setCurrentOrderClient({ ...currentOrderClient, nombre: e.target.value })}
                className="w-full bg-[#0a0f1c] border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-white outline-none"
              />

              <input
                type="text"
                placeholder="Teléfono / WhatsApp *"
                value={currentOrderClient.telefono}
                onChange={(e) => setCurrentOrderClient({ ...currentOrderClient, telefono: e.target.value })}
                className="w-full bg-[#0a0f1c] border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
              />

              {currentOrderPayment.tipo === 'envio' && (
                <input
                  type="text"
                  placeholder="Dirección de Entrega *"
                  value={currentOrderClient.direccion}
                  onChange={(e) => setCurrentOrderClient({ ...currentOrderClient, direccion: e.target.value })}
                  className="w-full bg-[#0a0f1c] border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              )}

              {currentOrderPayment.tipo === 'mesa' && (
                <input
                  type="text"
                  placeholder="Nº de Mesa (ej: Mesa 3) *"
                  value={currentOrderClient.mesa}
                  onChange={(e) => setCurrentOrderClient({ ...currentOrderClient, mesa: e.target.value })}
                  className="w-full bg-[#0a0f1c] border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                />
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1 font-bold">
                Medio de Pago:
              </label>
              <select
                value={currentOrderPayment.metodo}
                onChange={(e) => setCurrentOrderPayment({ ...currentOrderPayment, metodo: e.target.value as any })}
                className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="efectivo">Efectivo al recibir</option>
                <option value="debito">Tarjeta Débito (POS)</option>
                <option value="credito">Tarjeta Crédito (POS)</option>
                <option value="transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            {/* TOTALS DISPLAY */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>${cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/5">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400">${cartSubtotal}</span>
              </div>
            </div>

            {/* CONFIRM ORDER BUTTON */}
            <button
              type="button"
              onClick={handleConfirmPedidoFinal}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-2xl uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={14} /> Enviar Pedido a Cocina
            </button>

          </div>
        )}

      </div>

    </div>
  );
}
