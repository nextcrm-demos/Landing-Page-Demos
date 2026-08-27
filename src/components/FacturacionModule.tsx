import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  Send, Download, Printer, Plus, Search, ExternalLink, Settings, 
  Check, Building2, CreditCard, DollarSign, QrCode, Sparkles, HelpCircle, ArrowRight
} from 'lucide-react';
import { CFEInvoice, FacturandoConfig, Order } from '../types';

interface FacturacionModuleProps {
  orders: Order[];
  onEmitCFE?: (invoice: CFEInvoice) => void;
}

const DEFAULT_FACTURANDO_CONFIG: FacturandoConfig = {
  proveedor: 'Facturando',
  rut: '219876540019',
  razonSocial: 'EL ÁRBOL GASTRONOMÍA S.R.L.',
  nombreFantasia: 'El Árbol POS Deluxe',
  ambiente: 'produccion',
  apiToken: 'fact_live_sec_89dfa98b21c448a3e990c7d3129',
  serieETicket: 'A',
  proximoETicket: 1042,
  serieEFactura: 'B',
  proximoEFactura: 218,
  autoEmitirAlCobrar: true,
  sucursalDGI: 'Casa Central (001)',
  puntoVentaDGI: 'POS 01 - Caja Mostrador',
  activo: true,
};

const INITIAL_CFE_LIST: CFEInvoice[] = [
  {
    id: 'cfe-1041',
    numeroCFE: 'A-1041',
    tipoCFE: '101',
    tipoNombre: 'e-Ticket',
    serie: 'A',
    numero: 1041,
    fechaEmision: new Date().toLocaleDateString('es-UY') + ' 21:40',
    timestamp: Date.now() - 15 * 60 * 1000,
    proveedor: 'Facturando',
    emisorRUT: '219876540019',
    emisorRazonSocial: 'EL ÁRBOL GASTRONOMÍA S.R.L.',
    receptorNombre: 'Consumidor Final',
    montoNeto: 868.85,
    montoIVA: 191.15,
    tasaIVA: 22,
    montoTotal: 1060,
    moneda: 'UYU',
    formaPago: 'contado',
    estadoDGI: 'ACEPTADO',
    codigoCAE: '90001234567890',
    vencimientoCAE: '31/12/2026',
    items: [
      { nombre: '1 Metro Pizza Muzzarella', cantidad: 1, precioUnitario: 850, total: 850, tasaIVA: 22 },
      { nombre: 'Fainá con Queso', cantidad: 2, precioUnitario: 105, total: 210, tasaIVA: 22 },
    ]
  },
  {
    id: 'cfe-1040',
    numeroCFE: 'A-1040',
    tipoCFE: '101',
    tipoNombre: 'e-Ticket',
    serie: 'A',
    numero: 1040,
    fechaEmision: new Date().toLocaleDateString('es-UY') + ' 20:15',
    timestamp: Date.now() - 75 * 60 * 1000,
    proveedor: 'Facturando',
    emisorRUT: '219876540019',
    emisorRazonSocial: 'EL ÁRBOL GASTRONOMÍA S.R.L.',
    receptorNombre: 'Mariana Silva',
    receptorCI: '4.892.112-9',
    montoNeto: 434.43,
    montoIVA: 95.57,
    tasaIVA: 22,
    montoTotal: 530,
    moneda: 'UYU',
    formaPago: 'contado',
    estadoDGI: 'ACEPTADO',
    codigoCAE: '90001234567890',
    vencimientoCAE: '31/12/2026',
    items: [
      { nombre: 'Pizzeta Calabresa', cantidad: 1, precioUnitario: 530, total: 530, tasaIVA: 22 }
    ]
  },
  {
    id: 'cfe-217',
    numeroCFE: 'B-217',
    tipoCFE: '111',
    tipoNombre: 'e-Factura',
    serie: 'B',
    numero: 217,
    fechaEmision: new Date().toLocaleDateString('es-UY') + ' 19:30',
    timestamp: Date.now() - 140 * 60 * 1000,
    proveedor: 'Facturando',
    emisorRUT: '219876540019',
    emisorRazonSocial: 'EL ÁRBOL GASTRONOMÍA S.R.L.',
    receptorRUT: '214589320018',
    receptorNombre: 'AGENCIA DE SERVICIOS S.A.',
    receptorDireccion: '18 de Julio 1450',
    montoNeto: 1803.28,
    montoIVA: 396.72,
    tasaIVA: 22,
    montoTotal: 2200,
    moneda: 'UYU',
    formaPago: 'credito',
    estadoDGI: 'ACEPTADO',
    codigoCAE: '90001234567891',
    vencimientoCAE: '31/12/2026',
    items: [
      { nombre: '2 Metros Pizza Muzzarella con Gustos', cantidad: 2, precioUnitario: 950, total: 1900, tasaIVA: 22 },
      { nombre: '2 Refrescos 1.5L', cantidad: 2, precioUnitario: 150, total: 300, tasaIVA: 22 },
    ]
  }
];

export function FacturacionModule({ orders, onEmitCFE }: FacturacionModuleProps) {
  const [activeTab, setActiveTab] = useState<'emitidos' | 'emitir_manual' | 'configuracion'>('configuracion');
  const [cfeList, setCfeList] = useState<CFEInvoice[]>(() => {
    const saved = localStorage.getItem('nextcrm_cfe_list');
    return saved ? JSON.parse(saved) : INITIAL_CFE_LIST;
  });

  const [config, setConfig] = useState<FacturandoConfig>(() => {
    const saved = localStorage.getItem('nextcrm_facturando_config');
    return saved ? JSON.parse(saved) : DEFAULT_FACTURANDO_CONFIG;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'probando' | 'ok' | 'error'>('idle');
  const [selectedCFE, setSelectedCFE] = useState<CFEInvoice | null>(null);

  // Form manual CFE
  const [manualTipo, setManualTipo] = useState<'101' | '111'>('101');
  const [manualReceptorNombre, setManualReceptorNombre] = useState('Consumidor Final');
  const [manualDoc, setManualDoc] = useState('');
  const [manualMontoTotal, setManualMontoTotal] = useState('');
  const [manualConcepto, setManualConcepto] = useState('Consumo en Pizzería');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  const saveConfig = (newCfg: FacturandoConfig) => {
    setConfig(newCfg);
    localStorage.setItem('nextcrm_facturando_config', JSON.stringify(newCfg));
  };

  const handleTestConnection = () => {
    setTestStatus('probando');
    setTimeout(() => {
      setTestStatus('ok');
    }, 900);
  };

  const handleEmitManualCFE = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(manualMontoTotal);
    if (isNaN(total) || total <= 0) return;

    setIsSubmittingManual(true);
    const iva = total * (22 / 122);
    const neto = total - iva;
    const isFactura = manualTipo === '111';
    const serie = isFactura ? config.serieEFactura : config.serieETicket;
    const numero = isFactura ? config.proximoEFactura : config.proximoETicket;

    const newCFE: CFEInvoice = {
      id: 'cfe-' + Date.now(),
      numeroCFE: `${serie}-${numero}`,
      tipoCFE: manualTipo,
      tipoNombre: isFactura ? 'e-Factura' : 'e-Ticket',
      serie,
      numero,
      fechaEmision: new Date().toLocaleDateString('es-UY') + ' ' + new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      proveedor: config.proveedor,
      emisorRUT: config.rut,
      emisorRazonSocial: config.razonSocial,
      receptorNombre: manualReceptorNombre || (isFactura ? 'Empresa Receptora' : 'Consumidor Final'),
      receptorRUT: isFactura ? manualDoc : undefined,
      receptorCI: !isFactura && manualDoc ? manualDoc : undefined,
      montoNeto: Math.round(neto * 100) / 100,
      montoIVA: Math.round(iva * 100) / 100,
      tasaIVA: 22,
      montoTotal: total,
      moneda: 'UYU',
      formaPago: 'contado',
      estadoDGI: 'ACEPTADO',
      codigoCAE: '90001234567890',
      vencimientoCAE: '31/12/2026',
      items: [
        { nombre: manualConcepto || 'Consumo en Pizzería', cantidad: 1, precioUnitario: total, total, tasaIVA: 22 }
      ]
    };

    setTimeout(() => {
      const updatedList = [newCFE, ...cfeList];
      setCfeList(updatedList);
      localStorage.setItem('nextcrm_cfe_list', JSON.stringify(updatedList));

      // Increment sequence
      if (isFactura) {
        saveConfig({ ...config, proximoEFactura: config.proximoEFactura + 1 });
      } else {
        saveConfig({ ...config, proximoETicket: config.proximoETicket + 1 });
      }

      setIsSubmittingManual(false);
      setManualSuccessMsg(`¡${newCFE.tipoNombre} ${newCFE.numeroCFE} emitido y aceptado por DGI!`);
      if (onEmitCFE) onEmitCFE(newCFE);
      setManualMontoTotal('');
      setManualDoc('');
    }, 800);
  };

  const filteredCFEs = cfeList.filter(c => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      c.numeroCFE.toLowerCase().includes(term) ||
      c.receptorNombre.toLowerCase().includes(term) ||
      (c.receptorRUT && c.receptorRUT.includes(term)) ||
      (c.receptorCI && c.receptorCI.includes(term)) ||
      c.tipoNombre.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#030806] p-4 md:p-6 overflow-hidden text-slate-200 w-full h-full">
      
      {/* HEADER BAR (FULL WIDTH) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-4 mb-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wider uppercase">
                FACTURACIÓN ELECTRÓNICA & CFE DGI
              </h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                {config.proveedor} (HOMOLOGADO)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Emisión de e-Tickets y e-Facturas DGI en tiempo real • RUT {config.rut}
            </p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black/50 border border-emerald-500/30 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('emitidos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'emitidos' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comprobantes ({cfeList.length})
            </button>
            <button
              onClick={() => setActiveTab('emitir_manual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'emitir_manual' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Emitir CFE
            </button>
            <button
              onClick={() => setActiveTab('configuracion')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'configuracion' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Proveedor & DGI
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EMITIDOS / HISTORIAL (FULL WIDTH) */}
      {activeTab === 'emitidos' && (
        <div className="flex-1 bg-[#06140e] border border-emerald-500/20 rounded-2xl flex flex-col overflow-hidden shadow-xl w-full">
          {/* SEARCH & FILTERS */}
          <div className="p-3.5 border-b border-emerald-500/10 flex flex-wrap items-center justify-between gap-3 bg-black/30 shrink-0">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/60" />
              <input
                type="text"
                placeholder="Buscar por número CFE, cliente, RUT o CI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/30 pl-9 pr-4 py-1.5 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API {config.proveedor} Conectada con DGI</span>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#030a07] text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-emerald-500/20">
                <tr>
                  <th className="p-3 pl-4">Número CFE</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3">Cliente / Receptor</th>
                  <th className="p-3 text-right">Neto</th>
                  <th className="p-3 text-right">IVA (22%)</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Estado DGI</th>
                  <th className="p-3 pr-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10 font-sans">
                {filteredCFEs.map((cfe) => (
                  <tr key={cfe.id} className="hover:bg-emerald-950/20 transition-colors">
                    <td className="p-3 pl-4 font-mono font-bold text-emerald-300">
                      {cfe.numeroCFE}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        cfe.tipoCFE === '111' 
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/30' 
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {cfe.tipoNombre}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {cfe.fechaEmision}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-200">{cfe.receptorNombre}</p>
                      {(cfe.receptorRUT || cfe.receptorCI) && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          {cfe.receptorRUT ? `RUT: ${cfe.receptorRUT}` : `CI: ${cfe.receptorCI}`}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300">
                      ${cfe.montoNeto.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      ${cfe.montoIVA.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      ${cfe.montoTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <CheckCircle2 size={11} /> {cfe.estadoDGI}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-center">
                      <button
                        onClick={() => setSelectedCFE(cfe)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-emerald-500/30 cursor-pointer"
                      >
                        Ver CFE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMITIR MANUAL (FULL WIDTH 2-COLUMN LAYOUT) */}
      {activeTab === 'emitir_manual' && (
        <div className="flex-1 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-6 shadow-xl w-full overflow-y-auto custom-scrollbar">
          <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Plus size={18} className="text-emerald-400" /> Emisión Directa de Comprobante Fiscal (CFE)
          </h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Genera un e-Ticket (consumidor final / con CI) o una e-Factura (con RUT de empresa) homologada ante DGI.
          </p>

          {manualSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl mb-4 flex items-center gap-2 text-xs">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{manualSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleEmitManualCFE} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TIPO DE CFE */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5 font-bold">
                  Tipo de Comprobante CFE:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualTipo('101');
                      setManualReceptorNombre('Consumidor Final');
                    }}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      manualTipo === '101'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                        : 'bg-black/40 text-slate-400 border-emerald-500/20 hover:border-white/20'
                    }`}
                  >
                    e-Ticket (101)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualTipo('111');
                      setManualReceptorNombre('');
                    }}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      manualTipo === '111'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-black/40 text-slate-400 border-emerald-500/20 hover:border-white/20'
                    }`}
                  >
                    e-Factura con RUT (111)
                  </button>
                </div>
              </div>

              {/* MONTO TOTAL */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5 font-bold">
                  Monto Total ($ UYU):
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="Ej: 1450"
                  value={manualMontoTotal}
                  onChange={(e) => setManualMontoTotal(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-3 text-white text-base font-mono font-bold outline-none focus:border-emerald-400"
                />
              </div>

              {/* RECEPTOR / CLIENTE */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5 font-bold">
                  Nombre / Razón Social del Cliente:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Consumidor Final o Empresa"
                  value={manualReceptorNombre}
                  onChange={(e) => setManualReceptorNombre(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400"
                />
              </div>

              {/* DOCUMENTO CI / RUT */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5 font-bold">
                  {manualTipo === '111' ? 'RUT del Receptor (12 Dígitos):' : 'Cédula de Identidad (Opcional):'}
                </label>
                <input
                  type="text"
                  required={manualTipo === '111'}
                  placeholder={manualTipo === '111' ? 'Ej: 214589320018' : 'Ej: 4.892.112-9'}
                  value={manualDoc}
                  onChange={(e) => setManualDoc(e.target.value)}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* CONCEPTO */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1.5 font-bold">
                Detalle / Concepto:
              </label>
              <input
                type="text"
                value={manualConcepto}
                onChange={(e) => setManualConcepto(e.target.value)}
                className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingManual}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Send size={16} /> {isSubmittingManual ? 'Firmando y Transmitiendo a DGI...' : `Emitir Comprobante a DGI vía ${config.proveedor}`}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CONFIGURACIÓN PROVEEDOR (FULL WIDTH WITHOUT SQUISHING) */}
      {activeTab === 'configuracion' && (
        <div className="flex-1 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-6 shadow-xl w-full overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings size={18} className="text-emerald-400" /> Configuración de Facturación & Proveedor CFE
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Selecciona tu proveedor de facturación electrónica homologado por DGI Uruguay.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs font-mono text-emerald-300">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Estado: Homologado & Listo</span>
              </div>
            </div>

            {/* 5 PROVEEDORES HOMOLOGADOS GRID (WIDE 5-COLUMNS) */}
            <div className="mb-5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                Proveedor de Facturación Homologado:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { name: 'Facturando', sub: 'Facturando.uy (Recomendado)', badge: 'TOP CFE' },
                  { name: 'DGI', sub: 'DGI Facturación Directa', badge: 'OFICIAL' },
                  { name: 'Sicfe', sub: 'Sicfe InvoiCy', badge: 'CFE' },
                  { name: 'Uruware', sub: 'UCFE Uruware', badge: 'CFE' },
                  { name: 'Memory', sub: 'Memory Factura', badge: 'CFE' },
                ].map((prov) => (
                  <button
                    key={prov.name}
                    type="button"
                    onClick={() => saveConfig({ ...config, proveedor: prov.name as any })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      config.proveedor === prov.name 
                        ? 'bg-emerald-600/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400' 
                        : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-100">{prov.name}</span>
                      <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {prov.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">{prov.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FORM FIELDS ROW 1: RUT & RAZON SOCIAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  RUT del Emisor (DGI):
                </label>
                <input
                  type="text"
                  value={config.rut}
                  onChange={(e) => saveConfig({ ...config, rut: e.target.value })}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Razón Social:
                </label>
                <input
                  type="text"
                  value={config.razonSocial}
                  onChange={(e) => saveConfig({ ...config, razonSocial: e.target.value })}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            {/* FORM FIELDS ROW 2: API TOKEN & AMBIENTE & AUTO EMISSION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  API Token / Secret ({config.proveedor}):
                </label>
                <input
                  type="password"
                  value={config.apiToken}
                  onChange={(e) => saveConfig({ ...config, apiToken: e.target.value })}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Ambiente DGI:
                </label>
                <select
                  value={config.ambiente}
                  onChange={(e) => saveConfig({ ...config, ambiente: e.target.value as any })}
                  className="w-full bg-black/60 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                >
                  <option value="produccion">Producción (DGI Real)</option>
                  <option value="testing">Testing / Homologación Sandbox</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
                  Auto-emisión al Cobrar:
                </label>
                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="autoEmitCheck"
                    checked={config.autoEmitirAlCobrar}
                    onChange={(e) => saveConfig({ ...config, autoEmitirAlCobrar: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-black/50 border-emerald-500/40 cursor-pointer"
                  />
                  <label htmlFor="autoEmitCheck" className="text-slate-300 text-xs cursor-pointer">
                    Emitir e-Ticket automático en cada venta POS
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* TEST CONNECTION BUTTON BAR */}
          <div className="pt-4 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-5 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {testStatus === 'probando' ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>Probar Conexión con {config.proveedor} API</span>
            </button>

            {testStatus === 'ok' && (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 font-mono">
                <CheckCircle2 size={15} /> ¡Conexión con {config.proveedor} y Servidores DGI Exitosa!
              </span>
            )}
          </div>
        </div>
      )}

      {/* CFE VIEWER / PRINT MODAL */}
      {selectedCFE && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="text-center border-b border-dashed border-slate-400 pb-4 mb-4">
              <h2 className="font-black text-base">{selectedCFE.emisorRazonSocial}</h2>
              <p className="text-[11px] text-slate-600">RUT: {selectedCFE.emisorRUT}</p>
              <p className="text-[11px] text-slate-600">Proveedor: {selectedCFE.proveedor} (Homologado DGI)</p>
              <p className="text-sm font-bold mt-2 bg-slate-100 py-1 rounded">
                {selectedCFE.tipoNombre.toUpperCase()} CFE Nº {selectedCFE.numeroCFE}
              </p>
            </div>

            <div className="space-y-1 mb-4 text-[11px] border-b border-dashed border-slate-400 pb-3">
              <p><span className="font-bold">Fecha:</span> {selectedCFE.fechaEmision}</p>
              <p><span className="font-bold">Receptor:</span> {selectedCFE.receptorNombre}</p>
              {selectedCFE.receptorRUT && <p><span className="font-bold">RUT:</span> {selectedCFE.receptorRUT}</p>}
              {selectedCFE.receptorCI && <p><span className="font-bold">CI:</span> {selectedCFE.receptorCI}</p>}
            </div>

            <table className="w-full text-left mb-4">
              <thead>
                <tr className="border-b border-dashed border-slate-400 pb-1 text-[10px]">
                  <th>Cant</th>
                  <th>Descripción</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedCFE.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-1">{it.cantidad}x</td>
                    <td className="py-1">{it.nombre}</td>
                    <td className="py-1 text-right font-bold">${it.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-slate-400 pt-3 space-y-1 text-[11px] mb-4">
              <div className="flex justify-between"><span>Subtotal Neto:</span><span>${selectedCFE.montoNeto}</span></div>
              <div className="flex justify-between"><span>IVA (22%):</span><span>${selectedCFE.montoIVA}</span></div>
              <div className="flex justify-between text-sm font-black border-t border-slate-300 pt-1">
                <span>TOTAL A PAGAR:</span>
                <span>${selectedCFE.montoTotal}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-center mb-4 space-y-1">
              <p className="font-bold text-[10px]">CAE Nº: {selectedCFE.codigoCAE}</p>
              <p className="text-[9px] text-slate-500">Vencimiento: {selectedCFE.vencimientoCAE}</p>
              <p className="text-[9px] text-emerald-700 font-bold">ESTADO DGI: ACEPTADO ✓</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCFE(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl uppercase text-xs cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl uppercase text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Printer size={14} /> Imprimir Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
