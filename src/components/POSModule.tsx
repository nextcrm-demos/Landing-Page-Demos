import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Minus, Trash2, X, ArrowRight, CheckCircle, 
  MessageSquare, Printer, Package, Mic, Sparkles, Search,
  MapPin, CreditCard, User, Edit3, FileText, Navigation, ExternalLink,
  Phone, Users, Check, AlertCircle, Map
} from 'lucide-react';
import { 
  MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Order, Client 
} from '../types';
import { gustosAdicionales, defaultClients } from '../data/defaults';

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
  clients?: Client[];
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
  clients = defaultClients,
}: POSModuleProps) {
  const payment = currentOrderPayment || { tipo: 'local', metodo: 'efectivo', notas: '', programado: false, horaProgramada: '', abono: '', propina: '', cadete: 'Samuel' };
  const client = currentOrderClient || { nombre: '', mesa: '', telefono: '', direccion: '' };

  const [selectedGustosList, setSelectedGustosList] = useState<Gusto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Client Autocomplete State
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement | null>(null);

  // Map & GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isPastingGPS, setIsPastingGPS] = useState(false);
  const [gpsInputText, setGpsInputText] = useState('');
  const [showMapPreview, setShowMapPreview] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleGusto = (g: Gusto) => {
    if (selectedGustosList.some(item => item.id === g.id)) {
      setSelectedGustosList(selectedGustosList.filter(item => item.id !== g.id));
    } else {
      setSelectedGustosList([...selectedGustosList, g]);
    }
  };

  const isPizzaOrPizzeta = (item: MenuItem) => {
    if (item.tieneGustos) return true;
    const cat = (item.categoria || '').toLowerCase();
    const name = (item.nombre || '').toLowerCase();
    return (
      cat === 'pizzas' ||
      cat === 'pizzetas' ||
      name.includes('pizza') ||
      name.includes('pizzeta') ||
      name.includes('metro') ||
      name.includes('muzza') ||
      name.includes('mozzarella')
    );
  };

  const categories = ['todos', 'pizzas', 'fainas', 'pizzetas', 'promos', 'sandwiches', 'bebidas', 'postres', 'figazza'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'todos' || item.categoria.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Client suggestions matching phone or name
  const filteredClients = clients.filter(c => {
    if (!clientSearchQuery.trim()) return false;
    const q = clientSearchQuery.toLowerCase().trim();
    const cleanPhoneQuery = q.replace(/\D/g, '');
    const clientPhone = (c.telefono || '').replace(/\D/g, '');
    return (
      (cleanPhoneQuery && clientPhone.includes(cleanPhoneQuery)) ||
      (c.nombre && c.nombre.toLowerCase().includes(q))
    );
  });

  const handleSelectClient = (c: Client) => {
    setCurrentOrderClient({
      ...client,
      nombre: c.nombre,
      telefono: c.telefono || '',
      direccion: c.direccion || '',
    });
    setClientSearchQuery('');
    setShowClientDropdown(false);
  };

  const handleParseAndSetGPS = (rawText: string) => {
    // Extract lat, lng (ej: -34.9011, -56.1645 or https://maps.google.com/?q=-34.9011,-56.1645)
    const coordMatch = rawText.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      setCoords({ lat, lng });
      setCurrentOrderClient({
        ...client,
        direccion: client.direccion ? `${client.direccion} (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})` : `Ubicación GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      });
      setShowMapPreview(true);
      setIsPastingGPS(false);
      setGpsInputText('');
    } else {
      alert('Formato de coordenadas no reconocido. Ejemplo válido: -34.9011, -56.1645 o link de Google Maps');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);

  return (
    <div className="flex-1 bg-[#050505] flex overflow-hidden relative font-sans">
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>

      {/* MODAL / OVERLAY DE SELECCIÓN DE GUSTOS PARA PIZZAS */}
      {selectedProduct ? (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto relative z-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full bg-[#0a0f1c]/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase bg-blue-500/10 px-2.5 py-1 rounded-full font-bold">
                  Personalizar Pizza / Gustos
                </span>
                <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">{selectedProduct.nombre}</h2>
                <p className="text-xs text-slate-400 mt-1">Selecciona gustos e ingredientes adicionales</p>
              </div>
              <button 
                onClick={() => { setSelectedProduct(null); setSelectedGustosList([]); }}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20}/>
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" /> Gustos & Ingredientes Disponibles:
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {selectedGustosList.length} seleccionados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-8 overflow-y-auto max-h-80 pr-1 custom-scrollbar">
              {gustosAdicionales.map(g => {
                const isSelected = selectedGustosList.some(item => item.id === g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGusto(g)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-md'
                        : 'bg-black/40 border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs">{g.nombre}</span>
                      {isSelected && <Check size={14} className="text-blue-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                      +${g.precio}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Subtotal Ítem</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${selectedProduct.precio + selectedGustosList.reduce((sum, g) => sum + g.precio, 0)}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => addToCart(selectedProduct, 1, selectedGustosList)} 
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Agregar a la Comanda
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          
          {/* STEPPER HEADER BAR */}
          <div className="bg-[#070b16] border-b border-white/10 px-4 py-2.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {[
                { step: 1, label: '1. Menú & Gustos' },
                { step: 2, label: '2. Cliente & Destino' },
                { step: 3, label: '3. Pago & Notas' },
              ].map(s => (
                <button
                  key={s.step}
                  onClick={() => setPosStep(s.step)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    posStep === s.step
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {onOpenAIModal && (
              <button
                onClick={() => onOpenAIModal('voice')}
                className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
              >
                <Mic size={13} className="text-purple-300" />
                <span className="hidden sm:inline">Pedido por Voz IA</span>
              </button>
            )}
          </div>

          {/* STEP 1: PRODUCTS SELECTION */}
          {posStep === 1 && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* CATEGORIES BAR & SEARCH */}
              <div className="p-3 bg-[#0a0f1c]/80 border-b border-white/10 flex flex-col sm:flex-row gap-2 justify-between items-center shrink-0">
                <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto custom-scrollbar py-0.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                        activeCategory === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors font-sans"
                  />
                </div>
              </div>

              {/* PRODUCTS GRID (CLEAN WITHOUT DESCRIPTIONS) */}
              <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start custom-scrollbar">
                {filteredItems.map(prod => {
                  const isCustomizable = isPizzaOrPizzeta(prod);
                  return (
                    <button
                      key={prod.id}
                      onClick={() => {
                        if (isCustomizable) {
                          setSelectedProduct(prod);
                        } else {
                          addToCart(prod, 1);
                        }
                      }}
                      className="bg-[#0e1626] hover:bg-[#131d33] border border-white/10 hover:border-blue-500/50 p-3.5 rounded-2xl flex flex-col justify-between text-left transition-all group shadow-md cursor-pointer h-24"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-300 transition-colors line-clamp-2 leading-tight">
                          {prod.nombre}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/5">
                        <span className="text-xs sm:text-sm font-black text-white font-mono">
                          ${prod.precio}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          isCustomizable 
                            ? 'text-blue-300 bg-blue-600/20 border-blue-500/30' 
                            : 'text-emerald-300 bg-emerald-600/20 border-emerald-500/30'
                        }`}>
                          {isCustomizable ? '+ Gustos' : '+ Agregar'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: CLIENTE & DESTINO CON AUTOCOMPLETADO & MAPA */}
          {posStep === 2 && (
            <div className="flex-1 bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col p-6 md:p-8 items-center justify-start overflow-y-auto custom-scrollbar shadow-xl">
              <h2 className="text-lg font-bold tracking-wider text-white mb-5 uppercase flex items-center gap-2">
                <MapPin size={20} className="text-blue-400" /> Paso 2: Destino del Pedido & Datos del Cliente
              </h2>
              
              <div className="w-full max-w-xl space-y-4">
                
                {/* TIPO DE DESTINO */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1.5 block font-bold">
                    Tipo de Destino:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'local', label: 'Retiro en Local' },
                      { id: 'mesa', label: 'Salón / Mesa' },
                      { id: 'envio', label: 'Delivery / Envío' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setCurrentOrderPayment({...payment, tipo: t.id as any})}
                        className={`p-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                          payment.tipo === t.id
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                            : 'bg-black/40 text-slate-400 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FORM FIELDS CON BUSCADOR INTELIGENTE DE CLIENTES */}
                <div className="space-y-3.5 bg-black/50 p-4 rounded-2xl border border-white/10 relative">
                  
                  {/* AUTOCOMPLETADO DE CLIENTES POR TELÉFONO / NOMBRE */}
                  <div className="relative" ref={clientDropdownRef}>
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1 font-bold flex items-center justify-between">
                      <span>Teléfono / WhatsApp (Búsqueda o Registro) {payment.tipo === 'envio' ? '*' : ''}:</span>
                      <span className="text-[9px] text-blue-400 font-sans lowercase">Autocompleta o crea si es nuevo</span>
                    </label>

                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="tel" 
                        placeholder="Ej: 098 356 320" 
                        value={client.telefono} 
                        onChange={e => {
                          const val = e.target.value;
                          setCurrentOrderClient({...client, telefono: val});
                          setClientSearchQuery(val);
                          setShowClientDropdown(true);
                        }} 
                        onFocus={() => {
                          setClientSearchQuery(client.telefono || client.nombre);
                          setShowClientDropdown(true);
                        }}
                        className={`w-full bg-black/80 border pl-9 pr-3 py-2.5 rounded-xl outline-none font-mono text-sm text-white ${formErrors.telefono ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                      />
                    </div>

                    {/* DROPDOWN DE CLIENTES EXISTENTES */}
                    {showClientDropdown && filteredClients.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#0e1629] border border-blue-500/40 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                        <div className="p-1.5 text-[10px] font-mono text-slate-400 border-b border-white/10 uppercase bg-black/40">
                          Clientes Registrados:
                        </div>
                        {filteredClients.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectClient(c)}
                            className="w-full p-2.5 text-left hover:bg-blue-600/20 flex items-center justify-between border-b border-white/5 transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="font-bold text-xs text-white block">{c.nombre}</span>
                              <span className="text-[11px] font-mono text-emerald-400">{c.telefono}</span>
                              {c.direccion && (
                                <span className="text-[10px] text-slate-400 block truncate max-w-xs">{c.direccion}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-blue-400 font-mono">Seleccionar</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {payment.tipo === 'mesa' ? (
                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1 font-bold">
                          Número de Mesa *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Mesa 4" 
                          value={client.mesa} 
                          onChange={e => setCurrentOrderClient({...client, mesa: e.target.value})} 
                          className={`w-full bg-black/80 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.mesa ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1 font-bold">
                          Nombre del Cliente {payment.tipo === 'envio' ? '*' : ''}
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ej: Juan Pérez" 
                          value={client.nombre} 
                          onChange={e => {
                            const val = e.target.value;
                            setCurrentOrderClient({...client, nombre: val});
                            setClientSearchQuery(val);
                          }} 
                          className={`w-full bg-black/80 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.nombre ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                        />
                      </div>
                    )}
                  </div>

                  {payment.tipo === 'envio' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block font-bold">
                          Dirección de Entrega *:
                        </label>
                        
                        <button
                          type="button"
                          onClick={() => setIsPastingGPS(!isPastingGPS)}
                          className="text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Navigation size={11} /> Pegar Coordenadas GPS
                        </button>
                      </div>

                      {/* GPS PASTE INPUT */}
                      {isPastingGPS && (
                        <div className="bg-[#0e1629] p-2.5 rounded-xl border border-cyan-500/40 space-y-2 animate-in fade-in duration-150">
                          <span className="text-[10px] text-slate-300 block">
                            Pega coordenadas (-34.9011, -56.1645) o link de Google Maps:
                          </span>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={gpsInputText}
                              onChange={e => setGpsInputText(e.target.value)}
                              placeholder="-34.90111, -56.16453 o enlace"
                              className="flex-1 bg-black border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleParseAndSetGPS(gpsInputText)}
                              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all"
                            >
                              Aplicar
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Calle, número, apartamento y esquinas" 
                          value={currentOrderClient.direccion} 
                          onChange={e => setCurrentOrderClient({...currentOrderClient, direccion: e.target.value})} 
                          className={`flex-1 bg-black/80 border p-2.5 rounded-xl outline-none font-sans text-sm text-white ${formErrors.direccion ? 'border-red-500' : 'border-white/15 focus:border-blue-400'}`} 
                        />

                        {currentOrderClient.direccion && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentOrderClient.direccion)}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Ver en Google Maps"
                            className="px-3 bg-white/5 hover:bg-white/15 border border-white/10 text-cyan-400 rounded-xl flex items-center justify-center transition-all"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>

                      {/* MAP PREVIEW BOX */}
                      {currentOrderClient.direccion && (
                        <div className="bg-[#070b16] border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono text-slate-300">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <Map size={13} /> Ubicación lista para delivery
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentOrderClient.direccion)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline text-[11px] flex items-center gap-1"
                          >
                            Abrir Mapa ↗
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
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

          {/* STEP 3: MEDIO DE PAGO & NOTAS */}
          {posStep === 3 && (
            <div className="flex-1 bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col p-6 md:p-8 items-center justify-start overflow-y-auto custom-scrollbar shadow-xl">
              <h2 className="text-lg font-bold tracking-wider text-white mb-5 uppercase flex items-center gap-2">
                <CreditCard size={20} className="text-blue-400" /> Paso 3: Medio de Pago & Notas
              </h2>
              
              <div className="w-full max-w-xl space-y-4">
                
                {/* SELECTOR MEDIO DE PAGO */}
                <div>
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-2 block font-bold">
                    Selecciona el Método de Pago:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['efectivo', 'debito', 'credito', 'transferencia'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCurrentOrderPayment({...currentOrderPayment, metodo: m as any})}
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

                {/* ADVERTENCIA ENVIAR POS PARA ENVIOS */}
                {payment.tipo === 'envio' && ['debito', 'credito'].includes(payment.metodo) && (
                  <div className="bg-amber-950/30 border border-amber-500/50 p-3 rounded-xl flex items-center gap-2.5 text-amber-300 text-xs">
                    <AlertCircle size={18} className="shrink-0 text-amber-400" />
                    <div>
                      <strong className="block text-white font-bold uppercase text-[11px]">⚠️ ¡Enviar POS Inalámbrico con el repartidor!</strong>
                      <span className="text-[11px]">Se imprimirá el aviso destacado en el voucher para el cadete.</span>
                    </div>
                  </div>
                )}

                {/* EFECTIVO / ABONO */}
                {currentOrderPayment.metodo === 'efectivo' && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                    <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1">
                      ¿Con cuánto abona en efectivo? (Para calcular cambio)
                    </label>
                    <div className="flex gap-2 items-center">
                      <span className="text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        placeholder="Ej: 1000"
                        value={currentOrderPayment.abono || ''}
                        onChange={e => setCurrentOrderPayment({...currentOrderPayment, abono: e.target.value})}
                        className="w-full bg-black border border-white/15 p-2 rounded-lg text-white font-mono text-sm outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                )}

                {/* NOTAS DEL PEDIDO */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                  <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block mb-1.5 font-bold">
                    Notas de Elaboración & Reparto (Se imprimen en el voucher):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Sin orégano en la segunda mitad, tocar timbre 4B..."
                    value={currentOrderPayment.notas || ''}
                    onChange={e => setCurrentOrderPayment({...currentOrderPayment, notas: e.target.value})}
                    className="w-full bg-black border border-white/15 p-2.5 rounded-lg text-white text-xs outline-none focus:border-blue-400 custom-scrollbar"
                  />
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
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Confirmar & Enviar a Cocina
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
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
                  <Printer size={16} /> Imprimir Comanda (2 Vouchers)
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

      {/* RIGHT SIDEBAR: COMANDA ACTUAL */}
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
              📍 {payment.tipo.toUpperCase()}
            </span>
            <span className="text-[10px] font-mono bg-black/60 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded">
              {payment.metodo.toUpperCase()}
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
                Selecciona pizzas, pizzetas o bebidas del menú para ordenar.
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

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg p-0.5">
                    <button 
                      onClick={() => {
                        if (item.cantidad > 1) {
                          setCart(cart.map((c, i) => i === index ? { ...c, cantidad: c.cantidad - 1 } : c));
                        } else {
                          setCart(cart.filter((_, i) => i !== index));
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="font-mono text-xs font-bold text-white px-1">
                      {item.cantidad}
                    </span>
                    <button 
                      onClick={() => {
                        setCart(cart.map((c, i) => i === index ? { ...c, cantidad: c.cantidad + 1 } : c));
                      }}
                      className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                    >
                      <Plus size={11} />
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

        {/* COMANDA FOOTER */}
        <div className="p-4 bg-black/60 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-400 font-mono">TOTAL A COBRAR</span>
            <span className="text-2xl font-black text-white font-mono">${cartTotal}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              if (posStep === 1) setPosStep(2);
              else if (posStep === 2 && validateClientData()) setPosStep(3);
              else if (posStep === 3) handleConfirmPedidoFinal();
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {posStep === 1 ? (
              <><span>Continuar a Datos</span> <ArrowRight size={14}/></>
            ) : posStep === 2 ? (
              <><span>Continuar al Cobro</span> <ArrowRight size={14}/></>
            ) : (
              <><span>Confirmar Pedido</span> <CheckCircle size={14}/></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
