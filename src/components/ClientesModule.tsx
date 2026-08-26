import React from 'react';
import { Users, Download, Printer, Plus, Edit, Trash2, MessageSquare, Pointer, FileSpreadsheet, Database } from 'lucide-react';
import { Client, ModalConfig } from '../types';
import { downloadCSV, printTableReport } from '../utils/printHelpers';

interface ClientesModuleProps {
  clientsDB: Client[];
  setClientsDB: React.Dispatch<React.SetStateAction<Client[]>>;
  triggerModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export function ClientesModule({
  clientsDB,
  setClientsDB,
  triggerModal,
  closeModal,
}: ClientesModuleProps) {

  // Descarga completa en formato JSON o CSV
  const handleDownloadFullData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clientsDB, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `directorio_clientes_completo_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCSV = () => {
    downloadCSV(
      ['ID Cliente', 'Nombre y Apellido', 'Teléfono / WhatsApp', 'Dirección de Entrega'],
      clientsDB.map(c => [c.id, c.nombre, c.telefono || 'Sin teléfono', c.direccion || 'Sin dirección']),
      `clientes_crm_pizzeria_${new Date().toISOString().slice(0,10)}.csv`
    );
  };

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* HEADER & ACTION BAR */}
        <div className="bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users size={20}/>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wider uppercase">Directorio & Agenda de Clientes</h2>
              <p className="text-xs text-slate-400">Base de datos de contactos, direcciones y frecuencias de compra ({clientsDB.length} clientes registrados)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* BOTÓN DESCARGAR INFO COMPLETA */}
            <button 
              onClick={handleDownloadCSV} 
              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="Descargar base de datos en formato Excel / CSV"
            >
              <FileSpreadsheet size={15} className="text-emerald-400" />
              <span>Descargar Info (CSV / Excel)</span>
            </button>

            <button 
              onClick={handleDownloadFullData} 
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
              title="Exportar copia completa en JSON"
            >
              <Database size={14} className="text-blue-400" />
              <span>Exportar JSON</span>
            </button>

            <button 
              onClick={() => printTableReport('Agenda de Clientes - NEXT CRM', ['Nombre','Teléfono','Dirección'], clientsDB.map(c=>[c.nombre, c.telefono || '-', c.direccion || '-']))} 
              className="p-2 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer" 
              title="Imprimir Listado PDF"
            >
              <Printer size={16}/>
            </button>

            <div className="w-px h-6 bg-white/10 my-auto hidden sm:block"></div>

            <button 
              onClick={() => triggerModal({
                type: 'input_form', 
                title: 'Nuevo Cliente',
                fields: [{name:'nombre', label:'Nombre y Apellido'}, {name:'telefono', label:'Teléfono / WhatsApp'}, {name:'direccion', label:'Dirección de Entrega'}],
                onConfirm: (data: any) => { if(data.nombre) setClientsDB([...clientsDB, {id: Date.now(), ...data}]); closeModal(); }
              })} 
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs tracking-wider uppercase rounded-xl hover:bg-blue-500 transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16}/> Nuevo Cliente
            </button>
          </div>
        </div>

        {/* CLIENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientsDB.map((cli) => (
            <div key={cli.id} className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/10 flex flex-col relative group hover:border-white/20 transition-colors shadow-lg">
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => triggerModal({
                    type: 'input_form', 
                    title: 'Editar Cliente', 
                    defaultValues: cli,
                    fields: [{name:'nombre', label:'Nombre y Apellido'}, {name:'telefono', label:'Teléfono'}, {name:'direccion', label:'Dirección'}],
                    onConfirm: (data: any) => { setClientsDB(clientsDB.map(c => c.id === cli.id ? {...c, ...data} : c)); closeModal(); }
                  })} 
                  className="text-slate-400 hover:text-blue-400 bg-white/5 p-1.5 rounded-lg border border-white/10 cursor-pointer"
                  title="Editar"
                >
                  <Edit size={13}/>
                </button>
                <button 
                  onClick={() => triggerModal({
                    type: 'confirm', 
                    title: 'Eliminar Cliente', 
                    message: `¿Seguro que deseas eliminar a ${cli.nombre}?`,
                    onConfirm: () => { setClientsDB(clientsDB.filter(c => c.id !== cli.id)); closeModal(); }
                  })} 
                  className="text-slate-400 hover:text-red-400 bg-white/5 p-1.5 rounded-lg border border-white/10 cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={13}/>
                </button>
              </div>

              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                  {cli.nombre.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-base text-white truncate">{cli.nombre}</h3>
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-2 mb-4">
                <MessageSquare size={13} className="text-emerald-400"/> {cli.telefono || 'Sin Teléfono registrado'}
              </p>

              <div className="mt-auto bg-black/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-slate-400 border border-white/5 truncate">
                <Pointer size={12} className="text-blue-400 shrink-0"/> 
                <span className="truncate">{cli.direccion || 'Sin Dirección (Retiro en local)'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
