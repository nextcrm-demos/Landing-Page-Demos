import React from 'react';
import { History, Download, Printer, Trash2, User } from 'lucide-react';
import { HistoricalTurn, ModalConfig } from '../types';
import { downloadCSV, printTableReport } from '../utils/printHelpers';

interface HistorialModuleProps {
  historicalTurns: HistoricalTurn[];
  setHistoricalTurns: React.Dispatch<React.SetStateAction<HistoricalTurn[]>>;
  triggerModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export function HistorialModule({
  historicalTurns,
  setHistoricalTurns,
  triggerModal,
  closeModal,
}: HistorialModuleProps) {
  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between mb-8 shadow-xl">
          <h2 className="text-base font-light text-white tracking-[0.15em] flex items-center gap-3 uppercase"><History size={20}/> Historial de Turnos</h2>
          <div className="flex gap-3">
            <button onClick={() => downloadCSV(['ID','Fecha','Ventas','Caja_Final', 'Usuario'], historicalTurns.map(h=>[h.id, h.fecha, h.v, h.c, h.cajero]), 'historial_turnos.csv')} className="p-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"><Download size={18}/></button>
            <button onClick={() => printTableReport('Historial de Turnos', ['Fecha', 'Ventas ($)', 'Caja Final ($)', 'Usuario'], historicalTurns.map(h=>[h.fecha, h.v, h.c, h.cajero]))} className="p-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"><Printer size={18}/></button>
            <div className="w-px h-6 bg-white/10 my-auto mx-1"></div>
            <button onClick={() => triggerModal({
              type: 'confirm', title: 'Vaciar Historial', message: '¡Peligro! Esto borrará todos los registros históricos de turnos. ¿Estás seguro?',
              onConfirm: () => { setHistoricalTurns([]); closeModal(); }
            })} className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-xs tracking-wider uppercase rounded-xl hover:bg-red-500 hover:text-white transition-colors cursor-pointer">Vaciar</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historicalTurns.map((turno) => (
            <div key={turno.id} className="bg-[#0a0f1c]/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 flex flex-col relative group hover:border-white/20 transition-colors">
              <button onClick={() => triggerModal({
                type: 'confirm', title: 'Eliminar Turno', message: '¿Borrar este turno específico del historial?',
                onConfirm: () => { setHistoricalTurns(historicalTurns.filter(t => t.id !== turno.id)); closeModal(); }
              })} className="absolute top-6 right-6 text-slate-600 hover:text-red-400 bg-white/5 p-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash2 size={14}/></button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/5 border border-white/10 text-slate-300 rounded-2xl flex items-center justify-center"><User size={20}/></div>
                <div>
                  <p className="text-[10px] font-light tracking-widest text-slate-500 uppercase mb-0.5">Operador del Turno</p>
                  <p className="font-medium text-white text-lg">{turno.cajero}</p>
                </div>
                <div className="text-right ml-auto mr-10">
                  <p className="text-[9px] font-light tracking-widest text-slate-500 uppercase mb-0.5">Cierre</p>
                  <p className="font-light text-slate-300 text-sm">{turno.fecha}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                  <p className="text-[10px] font-light tracking-widest text-slate-400 uppercase mb-1">Ventas Turno</p>
                  <p className="font-light text-2xl text-white">${turno.v}</p>
                </div>
                <div className="bg-emerald-900/10 rounded-2xl p-4 border border-emerald-500/20">
                  <p className="text-[10px] font-light tracking-widest text-emerald-500 uppercase mb-1">Caja Final</p>
                  <p className="font-medium text-2xl text-emerald-400">${turno.c}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
