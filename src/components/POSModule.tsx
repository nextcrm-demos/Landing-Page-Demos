import React, { useState } from 'react';
import { 
  Plus, Minus, Trash2, X, ArrowRight, CheckCircle, 
  MessageSquare, Printer, Package, Mic, Sparkles, Search,
  MapPin, CreditCard, User, Edit3
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

const PREPARATION_QUICK_CHIPS = [
  'MOZZARELLA DEL MEDIO',
  'MOZZARELLA DEL ORILLO',
  'BIEN DORADA / TOSTADA',
  'MASA FINA',
  'SIN ORÉGANO',
  'SIN CEBOLLA',
  'POCO QUESO',
  'CORTAR EN 8',
  'TOCAR TIMBRE',
];

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
  const [searchTerm, setSearchTerm] = useState('');

  const selectedGustosList: Gusto[] = (selectedProduct as any)?.gustos || [];

  const cartTotal = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const categories = [
    'todos', 'promos', 'pizzas', 'pizzetas', 'fainas', 'figazzas', 'sandwiches', 'bebidas', 'postres'
  ];

  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === 'todos' || item.categoria === activeCategory;
    const matchSearch = searchTerm === '' || 
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddPrepObservation = (chip: string) => {
    const currentNotas = currentOrderPayment.notas || '';
    if (currentNotas.includes(chip)) return;
    const newNotas = currentNotas ? `${currentNotas}, ${chip}` : chip;
    setCurrentOrderPayment({ ...currentOrderPayment, notas: newNotas });
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#030806] relative text-slate-200">
      
      {/* GUSTOS SELECTION MODAL */}
      {selectedProduct ? (
        <div className="flex-1 bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8 overflow-hidden relative z-10">
          <div className="w-full max-w-6xl mx-auto flex flex-col h-full bg-[#06140e] border border-emerald-500/30 rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="bg-[#030a07] text-white p-5 flex justify-between items-center shrink-0 border-b border-emerald-500/20">
              <h3 className="font-bold text-lg tracking-wider uppercase text-emerald-400">
                Opciones de Gustos - {selectedProduct.nombre}
              </h3>
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="text-slate-400 hover:text-white bg-black/40 p-2.5 rounded-full transition-colors border border-white/5 cursor-pointer"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-6 flex items-center gap-2">
                <Plus size={14} className="text-emerald-400" /> Agregar gustos a la pizza
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {gustosAdicionales.map(gusto => {
                  const isSelected = selectedGustosList.some(g => g.id === gusto.id);
                  return (
                    <button 
                      key={gusto.id} 
                      onClick={() => {
                        if (isSelected) {
                          const nextGustos = selectedGustosList.filter(g => g.id !== gusto.id);
                          setSelectedProduct({ ...selectedProduct, gustos: nextGustos } as any);
                        } else {
                          const nextGustos = [...selectedGustosList, gusto];
                          setSelectedProduct({ ...selectedProduct, gustos: nextGustos } as any);
                        }
                      }}
                      className={`p-3.5 rounded-xl border flex justify-between items-center transition-all shadow-sm cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                          : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <span className="text-sm font-medium">{gusto.nombre}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isSelected ? 'bg-emerald-500 text-black font-mono' : 'bg-white/10 text-slate-400'}`}>
                        +${gusto.precio}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 bg-[#030a07] border-t border-emerald-500/20 shrink-0">
              <button 
                onClick={() => addToCart(selectedProduct, 1, selectedGustosList)} 
                className="w-full bg-emerald-600 text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg flex items-center justify-center gap-3 cursor-pointer"
              >
                <Plus size={18}/> Agregar a Comanda
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col p-4 overflow-hidden relative z-10">
          
          {/* STEPPER HEADER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-3.5 mb-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-2 md:gap-3 text-xs font-mono font-bold">
              <button
                onClick={() => setPosStep(1)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  posStep === 1 
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. MENÚ & GUSTOS
              </button>
              
              <span className="text-emerald-700">›</span>

              <button
                onClick={() => setPosStep(2)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  posStep === 2 
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>2. DESTINO & CLIENTE</span>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-emerald-300">
                  [{currentOrderPayment.tipo.toUpperCase()}]
                </span>
              </button>

              <span className="text-emerald-700">›</span>

              <button
                onClick={() => setPosStep(3)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  posStep === 3 
                    ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>3. PAGO & CONFIRMAR</span>
                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-emerald-300">
                  [{currentOrderPayment.metodo.toUpperCase()}]
                </span>
              </button>
            </div>

            {/* AI VOICE BUTTON (MATCHING SCREENSHOT) */}
            {onOpenAIModal && (
              <button
                type="button"
                onClick={() => onOpenAIModal('voice')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600/40 to-teal-600/40 text-emerald-300 border border-emerald-400/50 hover:from-emerald-600 hover:to-teal-600 hover:text-white font-bold text-xs tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                title="Tomar pedido completo por dictado de voz inteligente con IA"
              >
                <Mic size={16} className="text-emerald-300 animate-pulse" />
                <span>PEDIDO POR VOZ AI</span>
              </button>
            )}
          </div>

          {/* STEP 1: MENU PRODUCTS & CATEGORIES */}
          {posStep === 1 && (
            <div className="flex-1 bg-[#06140e] backdrop-blur-md rounded-2xl border border-emerald-500/20 flex flex-col overflow-hidden shadow-xl">
              
              {/* CATEGORIES BAR + SEARCH */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#030a07] border-b border-emerald-500/20 shrink-0">
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1 min-w-[200px]">
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setActiveCategory(cat)} 
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                        activeCategory === cat 
                          ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                          : 'bg-black/30 text-slate-400 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/60" />
                  <input
                    type="text"
                    placeholder="BUSCAR PRODUCTO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-500/30 pl-8 pr-3 py-1.5 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              {/* PRODUCTS GRID */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start custom-scrollbar">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col hover:border-emerald-500/50 hover:bg-emerald-950/10 transition-all relative overflow-hidden group shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                        <span className="font-bold text-slate-100 text-sm leading-snug uppercase block">
                          {item.nombre}
                        </span>
                        {item.categoria === 'pizzas' || item.categoria === 'pizzetas' ? (
                          <span className="text-[10px] text-emerald-400/80 font-mono font-semibold">
                            [GUSTOS DISPONIBLES]
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-emerald-500/10">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">UNIDAD</span>
                        <span className="text-emerald-400 font-mono font-black text-base">
                          ${item.precio}
                        </span>
                      </div>

                      <button 
                        onClick={() => {
                          if (item.categoria === 'pizzas' || item.categoria === 'pizzetas') {
                            setSelectedProduct(item);
                          } else {
                            addToCart(item);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                        title="Agregar producto a la comanda"
                      >
                        <Plus size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DESTINO & CLIENTE */}
          {posStep === 2 && (
            <div className="flex-1 bg-[#06140e] backdrop-blur-md rounded-2xl border border-emerald-500/20 flex flex-col p-6 md:p-8 items-center justify-center overflow-y-auto custom-scrollbar shadow-xl">
              <h2 className="text-xl font-bold tracking-wider text-white mb-6 uppercase flex items-center gap-2">
                <User size={20} className="text-emerald-400" /> Paso 2: Datos del Cliente & Destino
              </h2>
              
              <div className="w-full max-w-2xl space-y-5">
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2 block">
                    Modalidad del Pedido
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'local', label: 'Local / Mostrador' },
                      { type: 'mesa', label: 'Mesa / Salón' },
                      { type: 'envio', label: 'Delivery / Envío' },
                    ].map(mod => (
                      <button 
                        key={mod.type}
                        type="button"
                        onClick={() => setCurrentOrderPayment({...currentOrderPayment, tipo: mod.type as any})} 
                        className={`p-3.5 rounded-xl font-bold transition-all text-xs tracking-wider uppercase cursor-pointer ${
                          currentOrderPayment.tipo === mod.type 
                            ? 'bg-emerald-600 text-white border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {mod.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 p-5 rounded-2xl border border-emerald-500/20 space-y-4">
                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                      Nombre del Cliente
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej: Juan Pérez / Consumidor Final" 
                      value={currentOrderClient.nombre} 
                      onChange={e => setCurrentOrderClient({...currentOrderClient, nombre: e.target.value})} 
                      className={`w-full bg-black/60 border p-3 rounded-xl outline-none font-sans text-sm text-white placeholder:text-slate-600 transition-colors ${
                        formErrors.nombre ? 'border-red-500' : 'border-emerald-500/30 focus:border-emerald-400'
                      }`}
                    />
                    {formErrors.nombre && <span className="text-[10px] text-red-400 mt-1 block">{formErrors.nombre}</span>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                        Número de Mesa (Si aplica)
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: Mesa 4" 
                        value={currentOrderClient.mesa} 
                        onChange={e => setCurrentOrderClient({...currentOrderClient, mesa: e.target.value})} 
                        disabled={currentOrderPayment.tipo !== 'mesa'}
                        className="w-full bg-black/60 border border-emerald-500/30 p-3 rounded-xl outline-none font-sans text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                        Teléfono / Celular
                      </label>
                      <input 
                        type="text" 
                        placeholder="099 123 456" 
                        value={currentOrderClient.telefono} 
                        onChange={e => setCurrentOrderClient({...currentOrderClient, telefono: e.target.value})} 
                        className="w-full bg-black/60 border border-emerald-500/30 p-3 rounded-xl outline-none font-sans text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 font-mono" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                      Dirección de Envío (Delivery)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Calle, número de puerta, apartamento y esquinas" 
                      value={currentOrderClient.direccion} 
                      onChange={e => setCurrentOrderClient({...currentOrderClient, direccion: e.target.value})} 
                      disabled={currentOrderPayment.tipo !== 'envio'}
                      className="w-full bg-black/60 border border-emerald-500/30 p-3 rounded-xl outline-none font-sans text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPosStep(1)}
                    className="px-5 py-3 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    ‹ Volver a Menú
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateClientData()) {
                        setPosStep(3);
                      }
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                  >
                    Continuar al Pago ›
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAGO & CONFIRMAR */}
          {posStep === 3 && (
            <div className="flex-1 bg-[#06140e] backdrop-blur-md rounded-2xl border border-emerald-500/20 flex flex-col p-6 md:p-8 items-center justify-center overflow-y-auto custom-scrollbar shadow-xl">
              <h2 className="text-xl font-bold tracking-wider text-white mb-6 uppercase flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-400" /> Paso 3: Método de Pago & Confirmación
              </h2>
              
              <div className="w-full max-w-2xl space-y-5">
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2 block">
                    Selecciona el Medio de Pago
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['efectivo', 'debito', 'credito', 'transferencia'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCurrentOrderPayment({...currentOrderPayment, metodo: m})}
                        className={`p-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          currentOrderPayment.metodo === m
                            ? 'bg-emerald-600 text-white border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
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
                  <div className="bg-black/40 p-4 rounded-xl border border-emerald-500/20">
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                      ¿Con cuánto abona en efectivo? (Para calcular cambio)
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-mono font-bold text-lg">$</span>
                      <input
                        type="number"
                        placeholder="Ej: 2000"
                        value={currentOrderPayment.abono}
                        onChange={(e) => setCurrentOrderPayment({...currentOrderPayment, abono: e.target.value})}
                        className="flex-1 bg-black/60 border border-emerald-500/30 p-2.5 rounded-xl text-white font-mono text-base focus:outline-none focus:border-emerald-400"
                      />
                      {currentOrderPayment.abono && Number(currentOrderPayment.abono) >= cartTotal && (
                        <div className="text-right">
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
                <div className="bg-black/60 p-4 rounded-xl border border-emerald-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-mono block">Monto Total a Cobrar:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">${cartTotal}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-bold uppercase">{currentOrderClient.nombre || 'Consumidor Final'}</span>
                    <span className="text-[10px] text-emerald-400 font-mono block">Destino: {currentOrderPayment.tipo.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPosStep(2)}
                    className="px-5 py-3 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    ‹ Volver a Cliente
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPedidoFinal}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase py-3.5 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="flex-1 bg-[#06140e] backdrop-blur-md rounded-2xl border border-emerald-500/20 flex flex-col p-8 items-center justify-center overflow-y-auto custom-scrollbar shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle size={36} />
              </div>

              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
                ¡Pedido #{lastConfirmedOrder.id} Confirmado!
              </h2>
              <p className="text-xs text-emerald-400 font-mono mb-6">
                Enviado a cocina • Estado: {lastConfirmedOrder.estado.toUpperCase()}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => printTicketFn(lastConfirmedOrder)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase flex items-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Printer size={16} /> Imprimir Comanda
                </button>

                <button 
                  onClick={handleNewOrder}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
                >
                  Nueva Orden
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RIGHT SIDEBAR: COMANDA ACTUAL (MATCHING SCREENSHOT) */}
      <div className="w-[340px] md:w-[370px] bg-[#06120e] backdrop-blur-md border-l border-emerald-500/20 flex flex-col z-10 shrink-0">
        
        {/* COMANDA HEADER */}
        <div className="p-3.5 bg-[#030a07] border-b border-emerald-500/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package size={17} className="text-emerald-400"/>
            <h3 className="font-bold text-xs tracking-wider uppercase text-white">
              Comanda Actual
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
              📍 {currentOrderPayment.tipo.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono bg-black/60 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded">
              {currentOrderPayment.metodo.toUpperCase()}
            </span>
          </div>
        </div>

        {/* OBSERVACIONES DE PREPARACIÓN SECTION (MATCHING SCREENSHOT) */}
        <div className="p-3 bg-[#030906] border-b border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
            <span className="font-bold text-emerald-400/90 flex items-center gap-1">
              <Edit3 size={11} /> OBSERVACIONES DE PREPARACIÓN:
            </span>
            {currentOrderPayment.notas && (
              <button
                type="button"
                onClick={() => setCurrentOrderPayment({...currentOrderPayment, notas: ''})}
                className="text-red-400 hover:text-red-300 text-[9px] cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <textarea
            value={currentOrderPayment.notas}
            onChange={(e) => setCurrentOrderPayment({...currentOrderPayment, notas: e.target.value})}
            placeholder="EJ: MOZZARELLA DEL MEDIO, BIEN TOSTADA, SIN ORÉGANO..."
            rows={2}
            className="w-full bg-black/60 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400 resize-none font-mono"
          />

          {/* QUICK CHIPS */}
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
            {PREPARATION_QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddPrepObservation(chip)}
                className="text-[9px] font-mono bg-black/50 hover:bg-emerald-950 text-slate-300 hover:text-emerald-200 border border-emerald-500/20 hover:border-emerald-500/50 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS LIST HEADER */}
        <div className="px-3.5 py-1.5 bg-black/40 border-b border-emerald-500/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>PRODUCTOS EN COMANDA ({cart.reduce((a, b) => a + b.cantidad, 0)})</span>
          <span className="text-emerald-400 font-bold">${cartTotal}</span>
        </div>

        {/* CART ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 content-start custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-10">
              <Package size={32} className="opacity-30 text-emerald-500"/>
              <p className="text-xs font-bold tracking-wider uppercase text-slate-500 font-mono">Comanda Vacía</p>
              <p className="text-[11px] text-slate-600 text-center max-w-[200px]">
                Selecciona productos del menú o pulsa "Pedido por Voz AI" para ordenar hablando.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="bg-black/50 border border-emerald-500/20 p-2.5 rounded-xl relative group hover:border-emerald-500/40 transition-colors">
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
                  <p className="text-[10px] font-mono text-emerald-300 mb-1.5 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    {item.notas}
                  </p>
                )}

                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-emerald-500/10">
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-0.5 border border-white/10">
                    <button 
                      onClick={() => {
                        if (item.cantidad > 1) {
                          const updated = [...cart];
                          updated[index].cantidad -= 1;
                          setCart(updated);
                        } else {
                          setCart(cart.filter((_, i) => i !== index));
                        }
                      }} 
                      className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <Minus size={11}/>
                    </button>
                    <span className="font-bold text-xs w-4 text-center text-white font-mono">{item.cantidad}</span>
                    <button 
                      onClick={() => {
                        const updated = [...cart];
                        updated[index].cantidad += 1;
                        setCart(updated);
                      }} 
                      className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    >
                      <Plus size={11}/>
                    </button>
                  </div>

                  <span className="font-mono font-bold text-sm text-emerald-400">
                    ${item.precio * item.cantidad}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SIDEBAR FOOTER WITH TOTAL & STEP ACTION */}
        <div className="p-3.5 bg-[#030a07] border-t border-emerald-500/20 flex flex-col gap-3 shrink-0">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs tracking-wider text-slate-300 uppercase font-mono">
              TOTAL COMANDA
            </span>
            <span className="font-black text-2xl text-emerald-400 font-mono">
              ${cartTotal}
            </span>
          </div>

          {posStep === 1 && (
            <button 
              disabled={cart.length === 0}
              onClick={() => setPosStep(2)} 
              className="w-full bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PASO 2: DESTINO & CLIENTE</span>
              <ArrowRight size={15}/>
            </button>
          )}

          {posStep === 2 && (
            <button 
              onClick={() => {
                if (validateClientData()) {
                  setPosStep(3);
                }
              }} 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PASO 3: PAGO & CONFIRMAR</span>
              <ArrowRight size={15}/>
            </button>
          )}

          {posStep === 3 && (
            <button 
              onClick={handleConfirmPedidoFinal} 
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle size={16}/>
              <span>CONFIRMAR COMANDA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
