import React from 'react';
import { BookOpen, RotateCcw, Plus, Edit, Trash2 } from 'lucide-react';
import { MenuItem, ModalConfig } from '../types';
import { defaultMenuList } from '../data/defaults';

interface MenuModuleProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  triggerModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export function MenuModule({
  menuItems,
  setMenuItems,
  triggerModal,
  closeModal,
}: MenuModuleProps) {
  const categories = Array.from(new Set(menuItems.map(m => m.categoria)));

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-8 shadow-xl">
          <h2 className="text-base font-light text-white tracking-[0.15em] flex items-center gap-3 uppercase"><BookOpen size={20}/> Menú y Precios</h2>
          <div className="flex gap-3">
            <button onClick={() => triggerModal({
              type: 'confirm', title: 'Restaurar Menú', message: 'Esto sobreescribirá el menú con los valores de fábrica. ¿Estás seguro?',
              onConfirm: () => { setMenuItems([...defaultMenuList]); closeModal(); }
            })} className="px-4 py-2.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium text-xs tracking-wider uppercase rounded-xl hover:bg-yellow-500/20 transition-colors flex items-center gap-2 cursor-pointer"><RotateCcw size={14}/> Reset</button>
            <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
            <button onClick={() => triggerModal({
              type: 'input_form', title: 'Nuevo Producto',
              fields: [{name:'nombre', label:'Nombre'}, {name:'categoria', label:'Categoría (pizzas, postres, etc)'}, {name:'precio', label:'Precio ($)'}],
              onConfirm: (data: any) => { if(data.nombre) setMenuItems([...menuItems, {id: Date.now(), nombre: data.nombre, categoria: data.categoria.toLowerCase(), precio: Number(data.precio)||0}]); closeModal(); }
            })} className="px-5 py-2.5 bg-blue-600 text-white font-medium text-xs tracking-wider uppercase rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] flex items-center gap-2 cursor-pointer"><Plus size={16}/> Producto</button>
          </div>
        </div>
        
        {categories.map(cat => (
          <div key={cat} className="bg-[#0a0f1c]/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 mb-8">
            <h3 className="font-light tracking-[0.2em] text-sm text-slate-400 mb-6 uppercase pl-2 border-l-2 border-blue-500">{cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.filter(m => m.categoria === cat).map(item => (
                <div key={item.id} className="border border-white/10 rounded-2xl p-4 flex justify-between items-center bg-black/40 group hover:border-white/20 transition-colors">
                  <div>
                    <p className="text-xs font-light text-slate-200 uppercase mb-1.5 line-clamp-1" title={item.nombre}>{item.nombre}</p>
                    <p className="font-light text-emerald-400 text-lg">${item.precio}</p>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => triggerModal({
                      type: 'input_form', title: 'Editar Producto', defaultValues: item,
                      fields: [{name:'nombre', label:'Nombre'}, {name:'precio', label:'Precio ($)'}],
                      onConfirm: (data: any) => { setMenuItems(menuItems.map(m => m.id === item.id ? {...m, nombre: data.nombre, precio: Number(data.precio)||0} : m)); closeModal(); }
                    })} className="bg-white/5 border border-white/10 p-1.5 rounded-lg text-slate-400 hover:text-blue-400 cursor-pointer"><Edit size={12}/></button>
                    <button onClick={() => triggerModal({
                      type: 'confirm', title: 'Eliminar Producto', message: `¿Seguro que deseas borrar "${item.nombre}" del sistema?`,
                      onConfirm: () => { setMenuItems(menuItems.filter(m => m.id !== item.id)); closeModal(); }
                    })} className="bg-white/5 border border-white/10 p-1.5 rounded-lg text-slate-400 hover:text-red-400 cursor-pointer"><Trash2 size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
