import React, { useState, useMemo } from 'react';
import { 
  Package, Download, Search, Plus, Minus, RefreshCw, Check, 
  AlertTriangle, Filter, Layers, ArrowUpRight, Sparkles, SlidersHorizontal, Save, RotateCcw
} from 'lucide-react';
import { MenuItem } from '../types';
import { downloadCSV, printTableReport } from '../utils/printHelpers';
import { saveStock } from '../lib/firebase';

interface StockModuleProps {
  menuItems: MenuItem[];
  stock: Record<string | number, number>;
  setStock: (stock: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => void;
  thresholds: { general: number; bebidas: number; postres: number };
}

export function StockModule({ menuItems, stock, setStock, thresholds }: StockModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [bulkAmount, setBulkAmount] = useState<number>(10);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Sync current stock to editing state if not modified
  const currentStockMap = useMemo(() => {
    const map: Record<string, number> = {};
    menuItems.forEach(item => {
      const idStr = String(item.id);
      map[idStr] = editingStock[idStr] !== undefined ? editingStock[idStr] : (stock[idStr] ?? 0);
    });
    return map;
  }, [menuItems, stock, editingStock]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(m => set.add(m.categoria));
    return ['todas', ...Array.from(set)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'todas' || item.categoria === selectedCategory;
      const matchSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  // Adjust stock value
  const handleAdjustStock = (itemId: string | number, delta: number) => {
    const idStr = String(itemId);
    const currentVal = currentStockMap[idStr] ?? 0;
    const newVal = Math.max(0, currentVal + delta);
    
    setEditingStock(prev => ({
      ...prev,
      [idStr]: newVal
    }));
    setHasUnsavedChanges(true);
  };

  // Direct manual stock value input
  const handleSetStockValue = (itemId: string | number, valueStr: string) => {
    const idStr = String(itemId);
    const parsed = valueStr === '' ? 0 : parseInt(valueStr, 10);
    const newVal = isNaN(parsed) ? 0 : Math.max(0, parsed);

    setEditingStock(prev => ({
      ...prev,
      [idStr]: newVal
    }));
    setHasUnsavedChanges(true);
  };

  // Save changes to state & Firestore
  const handleSaveChanges = async () => {
    const updatedStock: Record<string, number> = { ...stock, ...editingStock };
    setStock(updatedStock);
    await saveStock(updatedStock);
    setEditingStock({});
    setHasUnsavedChanges(false);
    setSaveSuccessMessage('¡Inventario actualizado y guardado correctamente en la base de datos!');
    setTimeout(() => setSaveSuccessMessage(''), 4000);
  };

  // Discard temporary edits
  const handleDiscardChanges = () => {
    setEditingStock({});
    setHasUnsavedChanges(false);
  };

  // Bulk add to all filtered items
  const handleBulkAdd = () => {
    if (isNaN(bulkAmount) || bulkAmount === 0) return;
    const newEdits: Record<string, number> = { ...editingStock };
    filteredItems.forEach(item => {
      const idStr = String(item.id);
      const current = currentStockMap[idStr] ?? 0;
      newEdits[idStr] = Math.max(0, current + bulkAmount);
    });
    setEditingStock(newEdits);
    setHasUnsavedChanges(true);
    setShowBulkModal(false);
  };

  // Summary statistics
  const totalUnits = useMemo(() => {
    return Object.values(currentStockMap).reduce((acc: number, val: number) => acc + (Number(val) || 0), 0);
  }, [currentStockMap]);


  const lowStockCount = useMemo(() => {
    return menuItems.filter(item => {
      const threshold = item.categoria === 'bebidas' 
        ? thresholds.bebidas 
        : item.categoria === 'postres' 
          ? thresholds.postres 
          : thresholds.general;
      const count = currentStockMap[String(item.id)] ?? 0;
      return count <= threshold;
    }).length;
  }, [menuItems, currentStockMap, thresholds]);

  const outOfStockCount = useMemo(() => {
    return menuItems.filter(item => (currentStockMap[String(item.id)] ?? 0) === 0).length;
  }, [menuItems, currentStockMap]);

  return (
    <div className="flex-1 bg-[#050505] p-4 md:p-8 overflow-y-auto relative custom-scrollbar">
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* TOP HEADER */}
        <div className="bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white tracking-[0.15em] flex items-center gap-3 uppercase">
              <Package size={22} className="text-blue-400" /> Control & Edición de Stock
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Modifica y ajusta las unidades de stock en tiempo real directamente desde este panel.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscardChanges}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Descartar
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                >
                  <Save size={15} /> Guardar Cambios
                </button>
              </div>
            )}

            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Reabastecimiento Rápido
            </button>

            <button 
              onClick={() => downloadCSV(['Producto', 'Categoría', 'Precio ($)', 'Stock Actual', 'Estado'], menuItems.map(m => {
                const count = currentStockMap[String(m.id)] ?? 0;
                return [m.nombre, m.categoria, m.precio, count, count === 0 ? 'Agotado' : count <= 10 ? 'Bajo' : 'Normal'];
              }), 'inventario_stock_pizzeria.csv')} 
              className="p-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold" 
              title="Exportar CSV"
            >
              <Download size={15} /> CSV
            </button>

            <button 
              onClick={() => printTableReport('Inventario de Stock de Pizzería', ['Producto', 'Categoría', 'Precio', 'Stock'], menuItems.map(m => [m.nombre, m.categoria, `$${m.precio}`, `${currentStockMap[String(m.id)] ?? 0}`]))} 
              className="p-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold" 
              title="Imprimir Inventario"
            >
              Imprimir
            </button>
          </div>
        </div>

        {/* NOTIFICACIÓN DE ÉXITO */}
        {saveSuccessMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs py-3 px-5 rounded-2xl flex items-center gap-2.5 animate-fade-in font-medium">
            <Check size={16} className="text-emerald-400" />
            {saveSuccessMessage}
          </div>
        )}

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Total Variedades</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{menuItems.length}</span>
              <span className="text-xs text-blue-400 font-medium">Ítems de Menú</span>
            </div>
          </div>

          <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Unidades en Stock</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400">{totalUnits}</span>
              <span className="text-xs text-slate-400 font-medium">Disponibles</span>
            </div>
          </div>

          <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Stock Bajo / Crítico</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{lowStockCount}</span>
              <span className="text-xs text-amber-400/80 font-medium">Requieren reposición</span>
            </div>
          </div>

          <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Sin Stock (Agotados)</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold ${outOfStockCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>{outOfStockCount}</span>
              <span className="text-xs text-red-400/80 font-medium">Ítems en 0</span>
            </div>
          </div>
        </div>

        {/* SEARCH AND CATEGORY FILTERS */}
        <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* INVENTORY GRID WITH DIRECT MODIFIERS */}
        <div className="bg-[#0a0f1c]/60 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold tracking-[0.15em] text-sm text-slate-300 uppercase pl-2 border-l-2 border-blue-500">
              Inventario de Productos ({filteredItems.length})
            </h3>
            <span className="text-xs text-slate-500">
              Usa los botones <span className="text-blue-400 font-bold">+ / -</span> o escribe directamente el valor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => {
              const idStr = String(item.id);
              const currentStock = currentStockMap[idStr] ?? 0;
              const threshold = item.categoria === 'bebidas' 
                ? thresholds.bebidas 
                : item.categoria === 'postres' 
                  ? thresholds.postres 
                  : thresholds.general;
              
              const isOut = currentStock === 0;
              const isLow = currentStock > 0 && currentStock <= threshold;
              const isModified = editingStock[idStr] !== undefined;

              return (
                <div 
                  key={item.id} 
                  className={`border rounded-2xl p-4.5 flex flex-col bg-black/40 transition-all ${
                    isModified 
                      ? 'border-blue-500/80 bg-blue-950/20 shadow-lg shadow-blue-950/30' 
                      : isOut 
                        ? 'border-red-500/40 bg-red-950/10' 
                        : isLow 
                          ? 'border-amber-500/40 bg-amber-950/10' 
                          : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Category & Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                      {item.categoria}
                    </span>
                    {isOut ? (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full uppercase">
                        Agotado
                      </span>
                    ) : isLow ? (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                        Bajo
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        Óptimo
                      </span>
                    )}
                  </div>

                  {/* Product Name */}
                  <h4 className="text-sm font-semibold text-white uppercase mb-4 h-10 line-clamp-2" title={item.nombre}>
                    {item.nombre}
                  </h4>

                  {/* Stock Input & Direct Value */}
                  <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Unidades:</span>
                    <input
                      type="number"
                      min="0"
                      value={currentStock}
                      onChange={(e) => handleSetStockValue(item.id, e.target.value)}
                      className={`w-20 text-right bg-transparent font-bold text-xl outline-none transition-colors ${
                        isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    />
                  </div>

                  {/* Quick Increment/Decrement Buttons */}
                  <div className="grid grid-cols-5 gap-1 mt-auto">
                    <button
                      onClick={() => handleAdjustStock(item.id, -10)}
                      disabled={currentStock < 10}
                      className="py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Restar 10"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, -1)}
                      disabled={currentStock <= 0}
                      className="py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Restar 1"
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, 1)}
                      className="py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                      title="Sumar 1"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, 5)}
                      className="py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Sumar 5"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleAdjustStock(item.id, 10)}
                      className="py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      title="Sumar 10"
                    >
                      +10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          )}
        </div>

        {/* BOTTOM FLOATING SAVE BAR IF UNSAVED CHANGES */}
        {hasUnsavedChanges && (
          <div className="sticky bottom-4 bg-[#0a0f1c]/95 border-2 border-emerald-500/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center justify-between z-30 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Tienes modificaciones de stock pendientes</p>
                <p className="text-xs text-slate-400">Guarda los cambios para que se sincronicen en el sistema y KDS.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Save size={16} /> Guardar en Stock
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE REABASTECIMIENTO RÁPIDO */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" /> Reabastecimiento Masivo
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Suma una cantidad fija a los <span className="text-blue-400 font-bold">{filteredItems.length}</span> productos que están visibles actualmente en la categoría <span className="text-white font-bold uppercase">{selectedCategory}</span>.
            </p>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Cantidad a Sumar a Cada Producto
              </label>
              <div className="flex gap-2">
                {[5, 10, 20, 50].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBulkAmount(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      bulkAmount === val
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(Number(e.target.value) || 0)}
                className="w-full mt-3 bg-black/50 border border-white/15 rounded-xl py-2.5 px-4 text-center font-bold text-lg text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkAdd}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                Aplicar (+{bulkAmount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
