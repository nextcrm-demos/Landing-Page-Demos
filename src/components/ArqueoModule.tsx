import React from 'react';
import { Wallet, Download, Printer } from 'lucide-react';
import { Order, HistoricalTurn, ModalConfig } from '../types';
import { downloadCSV, printTableReport, printCierreTurnoThermalTicket } from '../utils/printHelpers';

interface ArqueoModuleProps {
  dailyOrders: Order[];
  openingCash: string;
  cajeroName: string;
  historicalTurns: HistoricalTurn[];
  setHistoricalTurns: React.Dispatch<React.SetStateAction<HistoricalTurn[]>>;
  setIsCajaAbierta: (open: boolean) => void;
  setIsLocked: (locked: boolean) => void;
  setShowOpeningForm: (show: boolean) => void;
  setDailyOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setKitchenOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setReadyOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  triggerModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

export function ArqueoModule({
  dailyOrders,
  openingCash,
  cajeroName,
  historicalTurns,
  setHistoricalTurns,
  setIsCajaAbierta,
  setIsLocked,
  setShowOpeningForm,
  setDailyOrders,
  setKitchenOrders,
  setReadyOrders,
  triggerModal,
  closeModal,
}: ArqueoModuleProps) {
  const calculateTotals = () => {
    let t = { efectivo: 0, debito: 0, credito: 0, transferencia: 0, a_confirmar: 0, total_ventas: 0, total_propinas: 0 };
    dailyOrders.forEach(o => {
      const m = o.pago.metodo;
      const val = o.total;
      if (m === 'efectivo') t.efectivo += val;
      else if (m === 'debito') t.debito += val;
      else if (m === 'credito') t.credito += val;
      else if (m === 'transferencia') t.transferencia += val;
      else t.a_confirmar += val;
      
      t.total_ventas += val;
    });
    return t;
  };

  const t = calculateTotals();
  const cajaReal = Number(openingCash) + t.efectivo;

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between w-full mb-8 shadow-xl">
          <h2 className="text-base font-light text-white tracking-[0.15em] flex items-center gap-3 uppercase"><Wallet size={20}/> Gestión de Caja</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => printCierreTurnoThermalTicket({
                cajero: cajeroName,
                openingCash,
                dailyOrders,
                totals: t,
                triggerAlert: (msg) => triggerModal({ type: 'alert', title: 'Aviso', message: msg, onConfirm: closeModal })
              })}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Imprimir Ticket Térmico de Cierre (80mm)"
            >
              <Printer size={15} /> Ticket Térmico 80mm
            </button>
            <button onClick={() => downloadCSV(['Metodo','Monto'], [['Efectivo Físico', cajaReal], ['Efectivo Turno', t.efectivo], ['Debito', t.debito], ['Credito', t.credito], ['Transferencia', t.transferencia], ['A Confirmar', t.a_confirmar]], 'arqueo.csv')} className="p-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer" title="Exportar Arqueo"><Download size={18}/></button>
            <button onClick={() => printTableReport('Arqueo de Caja', ['Método', 'Monto ($)'], [['Caja Base Inicial', openingCash], ['Ingreso Efectivo', t.efectivo], ['Débito', t.debito], ['Crédito', t.credito], ['Transferencias', t.transferencia], ['A Confirmar', t.a_confirmar], ['TOTAL FÍSICO CAJA', cajaReal]])} className="p-2.5 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 border border-white/10 transition-colors cursor-pointer" title="Imprimir Informe"><Printer size={18}/></button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 w-full mb-10">
          {/* Arqueo Principal */}
          <div className="flex-1 bg-emerald-900/10 backdrop-blur-sm rounded-[2rem] p-8 border border-emerald-500/20 flex flex-col items-center justify-center text-center shadow-[0_0_30px_-10px_rgba(5,150,105,0.2)] relative">
            <span className="absolute top-4 left-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">Arqueo de Caja</span>
            <p className="text-xs font-light tracking-widest text-emerald-400 uppercase mb-4 mt-4">Efectivo Físico Esperado (Base + Efectivo)</p>
            <p className="text-6xl font-light text-emerald-400 mb-6">${cajaReal}</p>
            <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <p className="text-[10px] font-medium tracking-wide text-slate-300 uppercase">Ventas Totales del Día: <span className="text-white ml-2">${t.total_ventas}</span></p>
            </div>
          </div>
          
          <div className="flex-1 bg-[#0a0f1c]/50 backdrop-blur-sm rounded-[2rem] p-8 border border-white/10">
            <p className="text-xs font-light tracking-widest text-slate-400 uppercase mb-6 text-center">Ingresos del Turno</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[11px] font-light tracking-widest text-slate-400 uppercase">Efectivo</span><span className="font-medium text-emerald-400 text-lg">${t.efectivo}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[11px] font-light tracking-widest text-slate-400 uppercase">Débito</span><span className="font-medium text-white text-lg">${t.debito}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[11px] font-light tracking-widest text-slate-400 uppercase">Crédito</span><span className="font-medium text-white text-lg">${t.credito}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[11px] font-light tracking-widest text-slate-400 uppercase">Transferencia</span><span className="font-medium text-white text-lg">${t.transferencia}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] font-light tracking-widest text-orange-400 uppercase">A Confirmar (Mesas)</span><span className="font-medium text-orange-400 text-lg">${t.a_confirmar}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => triggerModal({
            type: 'confirm', title: 'Cerrar Caja Definitivamente', message: `¿Estás seguro que deseas archivar el turno actual de ${cajeroName}?`,
            onConfirm: () => {
              setHistoricalTurns([{id: Date.now(), fecha: new Date().toLocaleString(), v: t.total_ventas, c: cajaReal, cajero: cajeroName}, ...historicalTurns]);
              setIsCajaAbierta(false); 
              setIsLocked(true); 
              setShowOpeningForm(false); 
              setDailyOrders([]); 
              setKitchenOrders([]); 
              setReadyOrders([]);
              closeModal();
            }
          })} 
          className="bg-red-600/20 text-red-400 border border-red-500/30 font-medium px-12 py-5 rounded-2xl text-sm tracking-widest uppercase hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] mb-12 cursor-pointer"
        >
          Cerrar Caja y Archivar Turno
        </button>
      </div>
    </div>
  );
}
