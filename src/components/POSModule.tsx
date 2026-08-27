import React, { useState } from 'react';
import { 
  Plus, Minus, Trash2, X, ArrowRight, CheckCircle, 
  MessageSquare, Printer, Package, Mic, Sparkles, Search,
  MapPin, CreditCard, User, Edit3, FileText
} from 'lucide-react';
import { 
  MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Order 
} from '../types';
import { gustosAdicionales } from '../data/defaults';

interface POSModuleProps {
  selectedProduct: MenuItem | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<MenuItem | null>>;
  posStep: number;
  setPosStep: (step: number) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  menuItems: MenuItem[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: MenuItem, cant?: number, selectedGustos?: Gusto[]) => void;
  currentOrderClient: OrderClient;
  setCurrentOrderClient: React.Dispatch<React.SetStateAction<OrderClient>>;
  currentOrderPayment: OrderPayment;
  setCurrentOrderPayment: React.Dispatch<React.SetStateAction<OrderPayment>>;
  formErrors: Record<string, string>;
  validateClientData: () => boolean;
  handleConfirmPedidoFinal: () => void;
  lastConfirmedOrder: Order | null;
  handleNewOrder: () => void;
  printTicketFn: (order: Order | null) => void;
  onOpenAIModal?: (mode: 'guided_voice' | 'voice' | 'whatsapp') => void;
}

export function POSModule({
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
  printTicketFn,
  onOpenAIModal,
}: POSModuleProps) {
  const [selectedGustosList, setSelectedGustosList] = useState<Gusto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleGusto = (g: Gusto) => {
    if (selectedGustosList.some(item => item.id === g.id)) {
      setSelectedGustosList(selectedGustosList.filter(item => item.id !== g.id));
    } else {
      setSelectedGustosList([...selectedGustosList, g]);
    }
  };

  const categories = ['todos', 'pizzas', 'fainas', 'pizzetas', 'promos', 'sandwiches', 'bebidas', 'postres', 'figazza'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'todos' || item.categoria.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);

  return (
    <div className="flex-1 bg-[#050505] flex overflow-hidden relative">
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>

      {/* MODAL / OVERLAY DE SELECCIÓN DE GUSTOS PARA PIZZAS */}
      {selectedProduct ? (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full bg-[#0a0f1c]/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-1 rounded-full">
                  Personalizar Pizza / Gustos
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 uppercase tracking-wide">{selectedProduct.nombre}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedProduct.descripcion || 'Selecciona gustos o adicionales'}</p>
              </div>
              <button 
                onClick={() => { setSelectedProduct(null); setSelectedGustosList([]); }}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <X size={18}/>
              </button>
            </div>

            <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase mb-3">
              Gustos & Ingredientes Adicionales
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
              {gustosAdicionales.map(g => {
                const isSelected = selectedGustosList.some(item => item.id === g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGusto(g)}
                    className={`p-3 rounded-2xl border text-left transition-all flex justify-between items-center cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg' 
                        : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{g.nombre}</p>
                      <span className="text-[11px] font-mono text-blue-400">+${g.precio}</span>
                    </div>
                    {isSelected && <CheckCircle size={14} className="text-blue-400"/>}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto border-t border-white/10 pt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Total con adicionales:</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${selectedProduct.precio + selectedGustosList.reduce((sum, g) => sum + g.precio, 0)}
                </span>
              </div>

              <button 
                onClick={() => addToCart(selectedProduct, 1, selectedGustosList)} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16}/> Agregar a Comanda
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative z-10">
          
          {/* STEPPER HEADER BAR (AUTHENTIC DARK THEME) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0f1c]/90 border border-white/10 rounded-2xl p-3 mb-4 shrink-0 shadow-lg backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2 bg-black/60 border border-white/10 rounded-2xl p-1.5 text-xs font-bold font-mono">
              <button
                type="button"
                onClick={() => setPosStep(1)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  posStep === 1 
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>1. MENÚ & GUSTOS</span>
              </button>
              
              <span className="text-slate-600">›</span>

              <button
                type="button"
                onClick={() => setPosStep(2)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  posStep === 2 
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>2. DESTINO & CLIENTE</span>
                <span className="text-[9px] bg-black/50 px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-300 uppercase">
                  {currentOrderPayment.tipo}
                </span>
              </button>

              <span className="text-slate-600">›</span>

              <button
                type="button"
                onClick={() => setPosStep(3)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  posStep === 3 
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>3. PAGO & CONFIRMAR</span>
                <span className="text-[9px] bg-black/50 px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-300 uppercase">
                  {currentOrderPayment.metodo}
                </span>
              </button>
            </div>

            {/* AI VOICE BUTTON */}
            {onOpenAIModal && (
              <button
                type="button"
                onClick={() => onOpenAIModal('voice')}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                title="Tomar pedido por dictado de voz inteligente con IA"
              >
                <Mic size={15} className="text-emerald-400" />
                <span>PEDIDO POR VOZ</span>
                <span className="text-[9px] font-black bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">AI</span>
              </button>
            )}
          </div>

          {/* STEP 1: MENU PRODUCTS & CATEGORIES */}
          {posStep === 1 && (
            <div className="flex-1 bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-xl">
              
              {/* CATEGORIES BAR + SEARCH */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/40 border-b border-white/10 shrink-0">
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1 min-w-[200px]">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all cursor-pointer ${
                        activeCategory === cat 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="BUSCAR PRODUCTO..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* PRODUCTS GRID */}
              <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start custom-scrollbar">
                {filteredItems.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      if (prod.tieneGustos) {
                        setSelectedProduct(prod);
                      } else {
                        addToCart(prod, 1);
                      }
                    }}
                    className="bg-[#0e1626] hover:bg-[#131d33] border border-white/10 hover:border-blue-500/50 p-3.5 rounded-2xl flex flex-col justify-between text-left transition-all group shadow-md cursor-pointer h-28"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {prod.nombre}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                        {prod.descripcion || 'Sin descripción'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/5">
                      <span className="text-xs sm:text-sm font-black text-white font-mono">
                        ${prod.precio}
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                        {prod.tieneGustos ? '+ Gustos' : '+ Agregar'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DESTINO & CLIENTE */}
          {posStep === 2 && (
            <div className="flex-1 bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col p-6 md:p-8 items-center justify-center overflow-y-auto custom-scrollbar shadow-xl">
              <h2 className="text-lg font-bold tracking-wider text-white mb-6 uppercase flex items-center gap-2">
                <MapPin size={20} className="text-blue-400" /> Paso 2: Destino del Pedido & Datos
              </h2>
              
              <div className="w-full max-w-xl space-y-5">
                {/* TIPO DE DESTINO */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2 block">
                    Tipo de Destino
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'local', label: 'Retiro en Local' },
                      { id: 'mesa', label: 'Salón / Mesa' },
                      { id: 'envio', label: 'Delivery / Envío' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCurrentOrderPayment({...currentOrderPayment, tipo: t.id as any})}
                        className={`p-3.5 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          currentOrderPayment.tipo === t.id
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-black/40 text-slate-400 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FORM FIELDS */}
                <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentOrderPayment.tipo === 'mesa' ? (
                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                          Número de Mesa *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Mesa 4" 
                          value={currentOrderClient.mesa} 
                          onChange={e => setCurrentOrderClient({...currentOrderClient, mesa: e.target.value})} 
                          className={`w-full bg-black/60 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.mesa ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                          Nombre del Cliente {currentOrderPayment.tipo === 'envio' ? '*' : ''}
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Juan Pérez" 
                          value={currentOrderClient.nombre} 
                          onChange={e => setCurrentOrderClient({...currentOrderClient, nombre: e.target.value})} 
                          className={`w-full bg-black/60 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.nombre ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                        Teléfono / WhatsApp {currentOrderPayment.tipo === 'envio' ? '*' : ''}
                      </label>
                      <input 
                        type="tel" 
                        placeholder="Ej: 098 123 456" 
                        value={currentOrderClient.telefono} 
                        onChange={e => setCurrentOrderClient({...currentOrderClient, telefono: e.target.value})} 
                        className={`w-full bg-black/60 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.telefono ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                      />
                    </div>
                  </div>

                  {currentOrderPayment.tipo === 'envio' && (
                    <div>
                      <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                        Dirección de Entrega *
                      </label>
                      <input 
                        type="text" 
                        placeholder="Calle, número, apartamento y esquinas" 
                        value={currentOrderClient.direccion} 
                        onChange={e => setCurrentOrderClient({...currentOrderClient, direccion: e.target.value})} 
                        className={`w-full bg-black/60 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.direccion ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPosStep(1)}
                    className="px-5 py-3 rounded-xl bg-white/5 text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer border border-white/10"
                  >
                    ‹ Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateClientData()) {
                        setPosStep(3);
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Continuar al Cobro ›
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAGO & CONFIRMAR */}
          {posStep === 3 && (
            <div className="flex-1 bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col p-6 md:p-8 items-center justify-center overflow-y-auto custom-scrollbar shadow-xl">
              <h2 className="text-lg font-bold tracking-wider text-white mb-6 uppercase flex items-center gap-2">
                <CreditCard size={20} className="text-blue-400" /> Paso 3: Medio de Pago & Cobro
              </h2>
              
              <div className="w-full max-w-xl space-y-5">
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2 block">
                    Selecciona el Método de Pago
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['efectivo', 'debito', 'credito', 'transferencia'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCurrentOrderPayment({...currentOrderPayment, metodo: m})}
                        className={`p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          currentOrderPayment.metodo === m
                            ? 'bg-blue-600 text-white border border-blue-400 shadow-md'
                            : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CASH CHANGE INPUT */}
                {currentOrderPayment.metodo === 'efectivo' && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                      ¿Con cuánto abona en efectivo? (Para calcular cambio)
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono font-bold text-lg">$</span>
                      <input 
                        type="number" 
                        placeholder="Ej: 1000"
                        value={currentOrderPayment.abono}
                        onChange={e => setCurrentOrderPayment({...currentOrderPayment, abono: e.target.value})}
                        className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-base outline-none focus:border-blue-500 flex-1"
                      />
                      {Number(currentOrderPayment.abono) >= cartTotal && (
                        <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                          <span className="text-[10px] text-slate-400 block uppercase font-mono">Cambio:</span>
                          <span className="text-emerald-400 font-mono font-bold text-base">
                            ${Number(currentOrderPayment.abono) - cartTotal}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUMMARY ROW */}
                <div className="bg-black/60 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-mono block">Monto Total a Cobrar:</span>
                    <span className="text-2xl font-black text-white font-mono">${cartTotal}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-bold uppercase">{currentOrderClient.nombre || 'Consumidor Final'}</span>
                    <span className="text-[10px] text-blue-400 font-mono block">Destino: {currentOrderPayment.tipo.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPosStep(2)}
                    className="px-5 py-3 rounded-xl bg-white/5 text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer border border-white/10"
                  >
                    ‹ Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPedidoFinal}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={18} />
                    <span>CONFIRMAR Y ENVIAR A COCINA (${cartTotal})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMATION SCREEN (STEP 4) */}
          {posStep === 4 && lastConfirmedOrder && (
            <div className="flex-1 bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col p-8 items-center justify-center overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4 shadow-lg">
                <CheckCircle size={36} />
              </div>

              <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-1">
                ¡Pedido #{lastConfirmedOrder.id} Confirmado!
              </h2>
              <p className="text-xs text-blue-400 font-mono mb-6">
                Enviado a cocina • Estado: {lastConfirmedOrder.estado.toUpperCase()}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => printTicketFn(lastConfirmedOrder)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase flex items-center gap-2 border border-white/15 cursor-pointer"
                >
                  <Printer size={16} /> Imprimir Comanda
                </button>

                <button 
                  onClick={handleNewOrder}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase shadow-lg cursor-pointer"
                >
                  Nueva Orden
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RIGHT SIDEBAR: COMANDA ACTUAL (CLEAN AUTHENTIC DARK THEME) */}
      <div className="w-[340px] md:w-[360px] bg-[#0a0f1c] backdrop-blur-md border-l border-white/10 flex flex-col z-10 shrink-0">
        
        {/* COMANDA HEADER */}
        <div className="p-3.5 bg-black/40 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package size={17} className="text-blue-400"/>
            <h3 className="font-bold text-xs tracking-wider uppercase text-white">
              Comanda Actual
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              📍 {currentOrderPayment.tipo.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono bg-black/60 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded">
              {currentOrderPayment.metodo.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ITEMS LIST HEADER */}
        <div className="px-3.5 py-2 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>PRODUCTOS ({cart.reduce((a, b) => a + b.cantidad, 0)})</span>
          <span className="text-white font-bold text-sm">${cartTotal}</span>
        </div>

        {/* CART ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 content-start custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-10">
              <Package size={32} className="opacity-30 text-blue-500"/>
              <p className="text-xs font-bold tracking-wider uppercase text-slate-500 font-mono">Comanda Vacía</p>
              <p className="text-[11px] text-slate-600 text-center max-w-[200px]">
                Selecciona productos del menú o pulsa "Pedido por Voz" para ordenar.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="bg-black/50 border border-white/10 p-2.5 rounded-xl relative group hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs text-white leading-tight uppercase pr-2">
                    {item.nombre}
                  </span>
                  <button 
                    onClick={() => setCart(cart.filter((_, i) => i !== index))} 
                    className="text-slate-500 hover:text-red-400 p-0.5 cursor-pointer transition-colors"
                    title="Eliminar ítem"
                  >
                    <Trash2 size={13}/>
                  </button>
                </div>

                {item.notas && (
                  <p className="text-[10px] font-mono text-blue-300 mb-1.5 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {item.notas}
                  </p>
                )}

                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
                    <button 
                      onClick={() => {
                        if (item.cantidad > 1) {
                          setCart(cart.map((c, i) => i === index ? {...c, cantidad: c.cantidad - 1} : c));
                        } else {
                          setCart(cart.filter((_, i) => i !== index));
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-white/10 text-xs font-bold cursor-pointer"
                    >
                      <Minus size={11}/>
                    </button>
                    <span className="text-xs font-bold font-mono px-1 text-white">{item.cantidad}</span>
                    <button 
                      onClick={() => setCart(cart.map((c, i) => i === index ? {...c, cantidad: c.cantidad + 1} : c))}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-white/10 text-xs font-bold cursor-pointer"
                    >
                      <Plus size={11}/>
                    </button>
                  </div>

                  <span className="font-mono font-bold text-xs text-white">
                    ${item.precioUnitario * item.cantidad}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* NOTAS GENERALES DE LA COMANDA (LIMPIO SIN BOTONES RAROS) */}
        <div className="p-3 bg-black/50 border-t border-white/10 space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase block">
            Notas de Cocina:
          </label>
          <input
            type="text"
            value={currentOrderPayment.notas || ''}
            onChange={(e) => setCurrentOrderPayment({...currentOrderPayment, notas: e.target.value})}
            placeholder="Aclaraciones especiales (opcional)..."
            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {/* COMANDA FOOTER */}
        <div className="p-3.5 bg-black border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-slate-400">Total a Pagar:</span>
            <span className="text-xl font-black text-white font-mono">${cartTotal}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setCart([])}
              className="p-2.5 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Vaciar Comanda"
            >
              <Trash2 size={15}/>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setPosStep(2)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight size={14}/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
