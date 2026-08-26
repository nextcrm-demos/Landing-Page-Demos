import React from 'react';
import { X, AlertTriangle, Info, Wallet, CheckCircle } from 'lucide-react';
import { ModalConfig, Order } from '../types';

interface ModalsProps {
  modalConfig: ModalConfig | null;
  closeModal: () => void;
  paymentModalOrder: Order | null;
  setPaymentModalOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  payMesaMetodo: string;
  setPayMesaMetodo: (val: string) => void;
  payMesaAbono: string;
  setPayMesaAbono: (val: string) => void;
  payMesaPropina: string;
  setPayMesaPropina: (val: string) => void;
  finalizeDelivery: (orderId: string, nuevaDireccion?: string | null, nuevoPago?: any) => void;
}

export function Modals({
  modalConfig,
  closeModal,
  paymentModalOrder,
  setPaymentModalOrder,
  payMesaMetodo,
  setPayMesaMetodo,
  payMesaAbono,
  setPayMesaAbono,
  payMesaPropina,
  setPayMesaPropina,
  finalizeDelivery,
}: ModalsProps) {
  return (
    <>
      {modalConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0f1c]/95 border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
            <div className={`p-5 flex justify-between items-center border-b border-white/10 ${modalConfig.type === 'confirm' ? 'bg-red-900/20' : 'bg-white/5'}`}>
              <h3 className={`font-light text-sm tracking-[0.15em] uppercase flex items-center gap-3 ${modalConfig.type === 'confirm' ? 'text-red-400' : 'text-white'}`}>
                {modalConfig.type === 'confirm' ? <AlertTriangle size={18}/> : <Info size={18}/>} {modalConfig.title}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"><X size={20}/></button>
            </div>
            <div className="p-6 bg-transparent flex-1">
              {modalConfig.message && <p className="text-slate-300 font-light tracking-wide mb-6 text-sm">{modalConfig.message}</p>}
              {modalConfig.type === 'input_form' && modalConfig.fields && (
                <form 
                  id="modal-form" 
                  className="space-y-5" 
                  onSubmit={e => { 
                    e.preventDefault(); 
                    const formData = new FormData(e.target as HTMLFormElement); 
                    const data = Object.fromEntries(formData.entries()); 
                    modalConfig.onConfirm(data); 
                  }}
                >
                  {modalConfig.fields.map(f => (
                    <div key={f.name}>
                      <label className="text-[10px] font-light tracking-widest text-slate-400 uppercase block mb-2">{f.label}</label>
                      <input 
                        type="text" 
                        name={f.name} 
                        defaultValue={modalConfig.defaultValues?.[f.name] || ''} 
                        required 
                        className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:border-blue-500 outline-none font-light text-white transition-colors text-sm" 
                      />
                    </div>
                  ))}
                </form>
              )}
            </div>
            <div className="p-5 bg-white/5 border-t border-white/10 flex gap-3">
              <button onClick={closeModal} className="flex-1 bg-white/5 text-slate-300 font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors text-xs tracking-widest uppercase border border-white/10 cursor-pointer">Cancelar</button>
              {modalConfig.type === 'confirm' && (
                <button onClick={modalConfig.onConfirm} className="flex-1 bg-red-600/20 text-red-400 border border-red-500/30 font-medium py-3.5 rounded-xl hover:bg-red-600 hover:text-white transition-colors text-xs tracking-widest uppercase cursor-pointer">
                  Confirmar
                </button>
              )}
              {modalConfig.type === 'input_form' && (
                <button type="submit" form="modal-form" className="flex-1 bg-blue-600 text-white font-medium py-3.5 rounded-xl hover:bg-blue-500 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] transition-colors text-xs tracking-widest uppercase cursor-pointer">
                  Guardar
                </button>
              )}
              {modalConfig.type === 'alert' && (
                <button onClick={closeModal} className="flex-1 bg-blue-600 text-white font-medium py-3.5 rounded-xl hover:bg-blue-500 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)] transition-colors text-xs tracking-widest uppercase cursor-pointer">
                  Entendido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {paymentModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#0a0f1c]/95 border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
            <div className="p-5 flex justify-between items-center border-b border-white/10 bg-emerald-900/20">
              <h3 className="font-light text-sm tracking-[0.15em] uppercase text-emerald-400 flex items-center gap-3">
                <Wallet size={18}/> Cobrar Mesa {paymentModalOrder.cliente.mesa}
              </h3>
              <button onClick={() => setPaymentModalOrder(null)} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"><X size={20}/></button>
            </div>
            <div className="p-6 flex-1 space-y-5">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Total de la Orden</p>
                  <p className="text-3xl font-light text-white">${paymentModalOrder.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Cliente</p>
                  <p className="text-sm font-medium text-slate-300">{paymentModalOrder.cliente.nombre || 'Sin nombre'}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-light tracking-widest text-slate-400 uppercase mb-3 block">Método de Pago Final</label>
                <div className="grid grid-cols-4 gap-2">
                  {['efectivo', 'debito', 'credito', 'transferencia'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setPayMesaMetodo(m)} 
                      className={`p-3 rounded-xl font-medium transition-all text-[11px] tracking-wide capitalize cursor-pointer ${
                        payMesaMetodo === m 
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]' 
                          : 'bg-black/40 text-slate-400 border border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {payMesaMetodo === 'efectivo' && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] text-emerald-400 uppercase mb-2 block tracking-widest">Abona con</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">$</span>
                      <input 
                        type="number" 
                        value={payMesaAbono} 
                        onChange={e => setPayMesaAbono(e.target.value)} 
                        className="w-full bg-black/40 border border-emerald-500/50 p-2.5 pl-8 rounded-lg focus:border-emerald-400 outline-none text-white text-lg"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <label className="text-[10px] text-emerald-400 uppercase mb-2 block tracking-widest">Vuelto</label>
                    <p className="text-3xl font-light text-emerald-400">${payMesaAbono ? Math.max(0, Number(payMesaAbono) - paymentModalOrder.total) : 0}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-light tracking-widest text-slate-400 uppercase mb-2 block">Propina (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input 
                    type="number" 
                    value={payMesaPropina} 
                    onChange={e => setPayMesaPropina(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 p-3 pl-10 rounded-xl focus:border-blue-500 outline-none text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 bg-white/5 border-t border-white/10 flex gap-3">
              <button onClick={() => setPaymentModalOrder(null)} className="flex-1 bg-white/5 text-slate-300 font-medium py-3.5 rounded-xl hover:bg-white/10 border border-white/10 uppercase tracking-widest text-xs transition-colors cursor-pointer">Cancelar</button>
              <button 
                onClick={() => {
                  finalizeDelivery(paymentModalOrder.id, null, {
                    ...paymentModalOrder.pago,
                    metodo: payMesaMetodo,
                    abono: payMesaAbono,
                    propina: payMesaPropina
                  });
                  setPaymentModalOrder(null);
                }} 
                className="flex-[2] bg-emerald-600 text-white font-medium py-3.5 rounded-xl hover:bg-emerald-500 shadow-[0_0_15px_-3px_rgba(5,150,105,0.4)] uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle size={16}/> Confirmar y Cerrar Mesa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
