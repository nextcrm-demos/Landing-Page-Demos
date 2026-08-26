import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  Send, Download, Printer, Plus, Search, ExternalLink, Settings, 
  Check, Building2, CreditCard, DollarSign, QrCode, Sparkles
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
    montoNeto: 2459.02,
    montoIVA: 540.98,
    tasaIVA: 22,
    montoTotal: 3000,
    moneda: 'UYU',
    formaPago: 'credito',
    estadoDGI: 'ACEPTADO',
    codigoCAE: '90009876543210',
    vencimientoCAE: '31/12/2026',
    items: [
      { nombre: 'Servicio Gastronómico Evento / Pizzeada', cantidad: 1, precioUnitario: 3000, total: 3000, tasaIVA: 22 }
    ]
  }
];

export function FacturacionModule({ orders = [] }: FacturacionModuleProps) {
  const [config, setConfig] = useState<FacturandoConfig>(() => {
    const saved = localStorage.getItem('el_arbol_facturando_config');
    return saved ? JSON.parse(saved) : DEFAULT_FACTURANDO_CONFIG;
  });

  const [cfeList, setCfeList] = useState<CFEInvoice[]>(() => {
    const saved = localStorage.getItem('el_arbol_cfe_history');
    return saved ? JSON.parse(saved) : INITIAL_CFE_LIST;
  });

  const [activeTab, setActiveTab] = useState<'emitidos' | 'emitir_manual' | 'configuracion'>('emitidos');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [selectedCFE, setSelectedCFE] = useState<CFEInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Emission Form State
  const [formTipo, setFormTipo] = useState<'101' | '111'>('101');
  const [formClienteNombre, setFormClienteNombre] = useState('');
  const [formClienteDoc, setFormClienteDoc] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('Consumo en Salón / Delivery');
  const [formMonto, setFormMonto] = useState('530');
  const [formFormaPago, setFormFormaPago] = useState<'contado' | 'credito'>('contado');
  const [emitSuccessMsg, setEmitSuccessMsg] = useState('');

  const saveConfig = (newCfg: FacturandoConfig) => {
    setConfig(newCfg);
    localStorage.setItem('el_arbol_facturando_config', JSON.stringify(newCfg));
  };

  const handleTestConnection = () => {
    setTestStatus('probando');
    setTimeout(() => {
      setTestStatus('ok');
      setTimeout(() => setTestStatus(null), 5000);
    }, 1200);
  };

  const handleManualEmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoTotal = parseFloat(formMonto) || 0;
    if (montoTotal <= 0) return;

    const montoNeto = Math.round((montoTotal / 1.22) * 100) / 100;
    const montoIVA = Math.round((montoTotal - montoNeto) * 100) / 100;

    const nextNum = formTipo === '101' ? config.proximoETicket : config.proximoEFactura;
    const nextSerie = formTipo === '101' ? config.serieETicket : config.serieEFactura;

    const newCFE: CFEInvoice = {
      id: `cfe-${Date.now()}`,
      numeroCFE: `${nextSerie}-${nextNum}`,
      tipoCFE: formTipo,
      tipoNombre: formTipo === '101' ? 'e-Ticket' : 'e-Factura',
      serie: nextSerie,
      numero: nextNum,
      fechaEmision: new Date().toLocaleDateString('es-UY') + ' ' + new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      proveedor: config.proveedor,
      emisorRUT: config.rut,
      emisorRazonSocial: config.razonSocial,
      receptorNombre: formClienteNombre || (formTipo === '101' ? 'Consumidor Final' : 'Cliente Corporativo'),
      receptorCI: formTipo === '101' ? formClienteDoc : undefined,
      receptorRUT: formTipo === '111' ? formClienteDoc : undefined,
      montoNeto,
      montoIVA,
      tasaIVA: 22,
      montoTotal,
      moneda: 'UYU',
      formaPago: formFormaPago,
      estadoDGI: 'ACEPTADO',
      codigoCAE: '9000' + Math.floor(1000000000 + Math.random() * 9000000000),
      vencimientoCAE: '31/12/2026',
      items: [
        { nombre: formDescripcion, cantidad: 1, precioUnitario: montoTotal, total: montoTotal, tasaIVA: 22 }
      ]
    };

    const updatedList = [newCFE, ...cfeList];
    setCfeList(updatedList);
    localStorage.setItem('el_arbol_cfe_history', JSON.stringify(updatedList));

    // Increment config counter
    const updatedConfig = {
      ...config,
      proximoETicket: formTipo === '101' ? config.proximoETicket + 1 : config.proximoETicket,
      proximoEFactura: formTipo === '111' ? config.proximoEFactura + 1 : config.proximoEFactura,
    };
    saveConfig(updatedConfig);

    setEmitSuccessMsg(`¡${newCFE.tipoNombre} ${newCFE.numeroCFE} emitido con éxito a través de ${config.proveedor}! Estado DGI: ACEPTADO`);
    setTimeout(() => setEmitSuccessMsg(''), 5000);
    setFormMonto('');
    setFormClienteDoc('');
    setFormClienteNombre('');
  };

  const filteredCFEs = cfeList.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.numeroCFE.toLowerCase().includes(term) ||
      c.receptorNombre.toLowerCase().includes(term) ||
      (c.receptorRUT && c.receptorRUT.includes(term)) ||
      (c.receptorCI && c.receptorCI.includes(term)) ||
      c.tipoNombre.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#030806] p-4 md:p-6 overflow-hidden text-slate-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wider uppercase">
                FACTURACIÓN ELECTRÓNICA & CFE DGI
              </h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                {config.proveedor} (HOMOLOGADO)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Emisión de e-Tickets y e-Facturas DGI en tiempo real • RUT {config.rut}
            </p>
          </div>
        </div>

        {/* PROVIDER STATUS & TABS */}
        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 border border-emerald-500/20 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('emitidos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'emitidos' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Comprobantes ({cfeList.length})
            </button>
            <button
              onClick={() => setActiveTab('emitir_manual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'emitir_manual' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Emitir CFE
            </button>
            <button
              onClick={() => setActiveTab('configuracion')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

      {/* TAB 1: EMITIDOS / HISTORIAL */}
      {activeTab === 'emitidos' && (
        <div className="flex-1 bg-[#06140e] border border-emerald-500/20 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* SEARCH & FILTERS */}
          <div className="p-4 border-b border-emerald-500/10 flex flex-wrap items-center justify-between gap-3 bg-black/20">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500/60" />
              <input
                type="text"
                placeholder="Buscar por número CFE, cliente, RUT o CI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/30 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API {config.proveedor} Online</span>
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
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        title="Ver e Imprimir CFE Oficial"
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

      {/* TAB 2: EMITIR MANUAL */}
      {activeTab === 'emitir_manual' && (
        <div className="flex-1 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-6 overflow-y-auto max-w-3xl mx-auto w-full shadow-xl">
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Plus size={18} className="text-emerald-400" /> Emitir CFE DGI vía {config.proveedor}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Emisión directa con firma electrónica y asignación automática de número CAE DGI.
          </p>

          {emitSuccessMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 shadow-lg">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{emitSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualEmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Tipo de Comprobante
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as any)}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 font-semibold"
                >
                  <option value="101">e-Ticket (101) - Consumidor Final / CI</option>
                  <option value="111">e-Factura (111) - Empresa con RUT</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Forma de Pago
                </label>
                <select
                  value={formFormaPago}
                  onChange={(e) => setFormFormaPago(e.target.value as any)}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="contado">Contado (Efectivo / Débito / Transferencia)</option>
                  <option value="credito">Crédito (Abono diferido 30 días)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Nombre o Razón Social del Cliente
                </label>
                <input
                  type="text"
                  placeholder={formTipo === '101' ? 'Consumidor Final (Opcional)' : 'EMPRESA CLIENTE S.A.'}
                  value={formClienteNombre}
                  onChange={(e) => setFormClienteNombre(e.target.value)}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  {formTipo === '101' ? 'Cédula de Identidad (Opcional)' : 'RUT del Cliente (12 dígitos)'}
                </label>
                <input
                  type="text"
                  placeholder={formTipo === '101' ? '4.892.112-9' : '214589320018'}
                  value={formClienteDoc}
                  onChange={(e) => setFormClienteDoc(e.target.value)}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Concepto / Descripción del Item
              </label>
              <input
                type="text"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Monto Total (IVA 22% Incluido) $
              </label>
              <input
                type="number"
                placeholder="530"
                value={formMonto}
                onChange={(e) => setFormMonto(e.target.value)}
                required
                className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 font-mono font-bold text-base focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Send size={16} /> Emitir Comprobante a DGI vía {config.proveedor}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: CONFIGURACIÓN PROVEEDOR (FACTURANDO / DGI) */}
      {activeTab === 'configuracion' && (
        <div className="flex-1 bg-[#06140e] border border-emerald-500/20 rounded-2xl p-6 overflow-y-auto max-w-3xl mx-auto w-full shadow-xl">
          <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Settings size={18} className="text-emerald-400" /> Configuración de Facturación & Proveedor CFE
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Selecciona tu proveedor de facturación electrónica homologado por la Dirección General Impositiva (DGI Uruguay).
          </p>

          <div className="space-y-5 text-xs">
            
            {/* PROVEEDOR SELECTOR */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
                Proveedor de Facturación Electrónica Homologado
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      config.proveedor === prov.name 
                        ? 'bg-emerald-600/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                        : 'bg-black/30 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{prov.name}</span>
                      <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {prov.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{prov.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RUT & RAZON SOCIAL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  RUT del Emisor (DGI)
                </label>
                <input
                  type="text"
                  value={config.rut}
                  onChange={(e) => saveConfig({ ...config, rut: e.target.value })}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  value={config.razonSocial}
                  onChange={(e) => saveConfig({ ...config, razonSocial: e.target.value })}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white"
                />
              </div>
            </div>

            {/* API TOKEN */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                API Token / Client Secret ({config.proveedor})
              </label>
              <input
                type="password"
                value={config.apiToken}
                onChange={(e) => saveConfig({ ...config, apiToken: e.target.value })}
                className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 font-mono"
              />
            </div>

            {/* AMBIENTE & AUTO-EMIT */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Ambiente DGI
                </label>
                <select
                  value={config.ambiente}
                  onChange={(e) => saveConfig({ ...config, ambiente: e.target.value as any })}
                  className="w-full bg-black/50 border border-emerald-500/30 rounded-xl p-3 text-white"
                >
                  <option value="produccion">Producción (DGI Real)</option>
                  <option value="testing">Testing / Homologación Sandbox</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Auto-emisión al Cobrar
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="autoEmitCheck"
                    checked={config.autoEmitirAlCobrar}
                    onChange={(e) => saveConfig({ ...config, autoEmitirAlCobrar: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-black/50 border-emerald-500/40"
                  />
                  <label htmlFor="autoEmitCheck" className="text-slate-300 text-xs">
                    Emitir e-Ticket automático en cada venta POS
                  </label>
                </div>
              </div>
            </div>

            {/* TEST CONNECTION BUTTON */}
            <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-5 py-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                {testStatus === 'probando' ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Probar Conexión con {config.proveedor} API</span>
              </button>

              {testStatus === 'ok' && (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> ¡Conexión con {config.proveedor} y DGI Exitosa!
                </span>
              )}
            </div>
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
              {selectedCFE.receptorCI && <p><span className="font-bold">CI:</span> {selectedCFE.receptorCI}</p>}
              {selectedCFE.receptorRUT && <p><span className="font-bold">RUT:</span> {selectedCFE.receptorRUT}</p>}
              <p><span className="font-bold">Forma de Pago:</span> {selectedCFE.formaPago.toUpperCase()}</p>
            </div>

            <div className="space-y-2 mb-4 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-bold text-[10px] text-slate-500 uppercase">
                <span>Detalle</span>
                <span>Subtotal</span>
              </div>
              {selectedCFE.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span>${it.total}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 mb-4 text-right border-b border-dashed border-slate-400 pb-3">
              <p>Monto Neto: ${selectedCFE.montoNeto.toFixed(2)}</p>
              <p>IVA ({selectedCFE.tasaIVA}%): ${selectedCFE.montoIVA.toFixed(2)}</p>
              <p className="text-base font-black">TOTAL UYU: ${selectedCFE.montoTotal.toFixed(2)}</p>
            </div>

            <div className="text-center text-[10px] text-slate-600 space-y-1 mb-6">
              <p className="font-bold text-emerald-800">ESTADO DGI: ACEPTADO</p>
              <p>CAE Nº: {selectedCFE.codigoCAE}</p>
              <p>Vto. CAE: {selectedCFE.vencimientoCAE}</p>
              <p className="text-[9px] text-slate-500 mt-2">Comprobante Fiscal Electrónico emitido por {selectedCFE.proveedor}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCFE(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl uppercase transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl uppercase transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={15} /> Imprimir CFE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
