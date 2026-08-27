import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  Send, Download, Printer, Plus, Search, ExternalLink, Settings, 
  Check, Building2, CreditCard, DollarSign, QrCode, Sparkles, HelpCircle, ArrowRight,
  Code2, Database, Key, Server, Laptop, MessageSquare, ShieldAlert, Cpu
} from 'lucide-react';
import { CFEInvoice, FacturandoConfig, Order } from '../types';
import { 
  buildDGIRequestPayload, 
  emitirCFEEnProveedor, 
  buildWhatsAppInvoiceShareUrl,
  DGIRequestPayload,
  DGIResponsePayload
} from '../services/dgiInvoicingService';

interface FacturacionModuleProps {
  orders: Order[];
  onEmitCFE?: (invoice: CFEInvoice) => void;
}

const DEFAULT_FACTURANDO_CONFIG: FacturandoConfig = {
  proveedor: 'Facturando',
  rut: '219876540019',
  razonSocial: 'EL ÁRBOL GASTRONOMÍA S.R.L.',
  nombreFantasia: 'Pizzería Gourmet POS',
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
    codigoCAE: 'CAE-90001234567890',
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
    codigoCAE: 'CAE-90001234567890',
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
    codigoCAE: 'CAE-90001234567891',
    vencimientoCAE: '31/12/2026',
    items: [
      { nombre: '2 Metros Pizza Muzzarella con Gustos', cantidad: 2, precioUnitario: 950, total: 1900, tasaIVA: 22 },
      { nombre: '2 Refrescos 1.5L', cantidad: 2, precioUnitario: 150, total: 300, tasaIVA: 22 },
    ]
  }
];

export function FacturacionModule({ orders, onEmitCFE }: FacturacionModuleProps) {
  const [activeTab, setActiveTab] = useState<'emitidos' | 'fases_api' | 'emitir_manual' | 'configuracion'>('emitidos');
  const [cfeList, setCfeList] = useState<CFEInvoice[]>(() => {
    const saved = localStorage.getItem('nextcrm_cfe_list');
    return saved ? JSON.parse(saved) : INITIAL_CFE_LIST;
  });

  const [config, setConfig] = useState<FacturandoConfig>(() => {
    const saved = localStorage.getItem('nextcrm_facturando_config');
    return saved ? JSON.parse(saved) : DEFAULT_FACTURANDO_CONFIG;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCFE, setSelectedCFE] = useState<CFEInvoice | null>(null);

  // Form manual CFE
  const [manualTipo, setManualTipo] = useState<'101' | '111'>('101');
  const [manualReceptorNombre, setManualReceptorNombre] = useState('Consumidor Final');
  const [manualDoc, setManualDoc] = useState('');
  const [manualMontoTotal, setManualMontoTotal] = useState('850');
  const [manualConcepto, setManualConcepto] = useState('1 Metro Pizza Muzzarella');
  const [manualTelefono, setManualTelefono] = useState('098356320');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Live API JSON Inspector State
  const [lastRequestPayload, setLastRequestPayload] = useState<DGIRequestPayload | null>(() => {
    return buildDGIRequestPayload(
      { items: [{ name: '1 Metro Pizza Muzzarella', quantity: 1, price: 850, tasaIVA: 22 }], total: 850 },
      101,
      config
    );
  });
  const [lastResponsePayload, setLastResponsePayload] = useState<DGIResponsePayload | null>(null);

  const saveConfig = (newCfg: FacturandoConfig) => {
    setConfig(newCfg);
    localStorage.setItem('nextcrm_facturando_config', JSON.stringify(newCfg));
  };

  const handleEmitirCFE = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(manualMontoTotal);
    if (isNaN(monto) || monto <= 0) return;

    setIsSubmittingManual(true);
    setManualSuccessMsg('');

    const tipoCFENum = manualTipo === '101' ? 101 : 111;
    const docTipo = manualTipo === '111' ? 2 : manualDoc ? 3 : 4;

    const requestPayload = buildDGIRequestPayload(
      {
        items: [{ name: manualConcepto, quantity: 1, price: monto, tasaIVA: 22 }],
        total: monto,
        customerName: manualReceptorNombre,
        customerPhone: manualTelefono,
      },
      tipoCFENum,
      config,
      {
        docTipo,
        docNumero: manualDoc || (manualTipo === '111' ? '219876540019' : 'Consumidor Final'),
        nombre: manualReceptorNombre,
      },
      1
    );

    setLastRequestPayload(requestPayload);

    try {
      const response = await emitirCFEEnProveedor(requestPayload, config);
      setLastResponsePayload(response);

      const neto = requestPayload.totales.montoSubtotalSinIVA;
      const iva = requestPayload.totales.montoIVABasico22 + requestPayload.totales.montoIVAMinimo10;

      const newInvoice: CFEInvoice = {
        id: `cfe-${response.cfe.numero}`,
        numeroCFE: response.cfe.codigoCompleto,
        tipoCFE: manualTipo,
        tipoNombre: response.cfe.tipoNombre,
        serie: response.cfe.serie,
        numero: response.cfe.numero,
        fechaEmision: response.cfe.fechaEmision,
        timestamp: Date.now(),
        proveedor: config.proveedor,
        emisorRUT: config.rut,
        emisorRazonSocial: config.razonSocial,
        receptorNombre: manualReceptorNombre,
        receptorCI: manualTipo === '101' ? manualDoc : undefined,
        receptorRUT: manualTipo === '111' ? manualDoc : undefined,
        montoNeto: neto,
        montoIVA: iva,
        tasaIVA: 22,
        montoTotal: monto,
        moneda: 'UYU',
        formaPago: 'contado',
        estadoDGI: 'ACEPTADO',
        codigoCAE: response.cfe.codigoCAE,
        vencimientoCAE: response.cfe.vencimientoCAE,
        qrURL: response.cfe.qrCodeData,
        items: [
          { nombre: manualConcepto, cantidad: 1, precioUnitario: monto, total: monto, tasaIVA: 22 }
        ]
      };

      const updatedList = [newInvoice, ...cfeList];
      setCfeList(updatedList);
      localStorage.setItem('nextcrm_cfe_list', JSON.stringify(updatedList));

      // Incrementar consecutivo
      if (manualTipo === '101') {
        saveConfig({ ...config, proximoETicket: config.proximoETicket + 1 });
      } else {
        saveConfig({ ...config, proximoEFactura: config.proximoEFactura + 1 });
      }

      setIsSubmittingManual(false);
      setManualSuccessMsg(`¡${newInvoice.tipoNombre} ${newInvoice.numeroCFE} emitido y aprobado por DGI con éxito!`);
      setSelectedCFE(newInvoice);

      if (onEmitCFE) {
        onEmitCFE(newInvoice);
      }
    } catch (err) {
      setIsSubmittingManual(false);
    }
  };

  const handlePrintCFE = (inv: CFEInvoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${inv.tipoNombre} ${inv.numeroCFE}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 10px; font-size: 11px; color: #000; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .flex-between { display: flex; justify-content: space-between; }
            .qr-box { border: 2px solid #000; padding: 6px; margin: 8px auto; text-align: center; width: 140px; font-size: 9px; }
          </style>
        </head>
        <body>
          <div class="text-center bold" style="font-size: 13px;">${inv.emisorRazonSocial}</div>
          <div class="text-center">RUT: ${inv.emisorRUT}</div>
          <div class="text-center">${config.sucursalDGI}</div>
          <div class="divider"></div>
          
          <div class="text-center bold" style="font-size: 14px;">${inv.tipoNombre.toUpperCase()}</div>
          <div class="text-center bold">${inv.numeroCFE}</div>
          <div class="text-center">Fecha: ${inv.fechaEmision}</div>
          <div class="divider"></div>

          <div><strong>Cliente:</strong> ${inv.receptorNombre}</div>
          ${inv.receptorRUT ? `<div><strong>RUT:</strong> ${inv.receptorRUT}</div>` : ''}
          ${inv.receptorCI ? `<div><strong>CI:</strong> ${inv.receptorCI}</div>` : ''}
          <div class="divider"></div>

          <div class="bold flex-between"><span>DETALLE</span><span>TOTAL</span></div>
          ${inv.items.map(it => `
            <div class="flex-between">
              <span>${it.cantidad}x ${it.nombre}</span>
              <span>$${it.total}</span>
            </div>
          `).join('')}
          
          <div class="divider"></div>
          <div class="flex-between"><span>Subtotal (Sin IVA):</span><span>$${inv.montoNeto.toFixed(2)}</span></div>
          <div class="flex-between"><span>IVA (22%):</span><span>$${inv.montoIVA.toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="flex-between bold" style="font-size: 13px;">
            <span>TOTAL A PAGAR:</span>
            <span>$${inv.montoTotal} UYU</span>
          </div>
          <div class="divider"></div>

          <div class="qr-box">
            <div class="bold">CODIGO QR FISCAL</div>
            <div>[ DGI URUGUAY ]</div>
            <div style="font-size: 8px; margin-top: 3px;">Verificación Electrónica</div>
          </div>

          <div class="text-center" style="font-size: 9px;">
            <strong>CAE:</strong> ${inv.codigoCAE}<br/>
            <strong>Vto. CAE:</strong> ${inv.vencimientoCAE}<br/>
            <strong>Rango Autorizado:</strong> 1 al 100000<br/>
            I.V.A. al día • Facturando.uy
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredCFEs = cfeList.filter(c => 
    c.numeroCFE.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.receptorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.receptorRUT && c.receptorRUT.includes(searchTerm)) ||
    (c.receptorCI && c.receptorCI.includes(searchTerm))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] text-slate-100 overflow-y-auto custom-scrollbar p-4 md:p-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto w-full mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                <ShieldCheck size={12} /> Facturación Electrónica DGI • Partner Facturando.uy
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                config.ambiente === 'produccion' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
              }`}>
                {config.ambiente === 'produccion' ? '● MODO PRODUCCIÓN DGI' : '● MODO SANDBOX (PRUEBAS)'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Facturación Electrónica & CFE DGI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Emisión de e-Tickets (101) y e-Facturas (111), firma digital CAE, código QR oficial y sincronización con Facturando.uy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('emitir_manual')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus size={14} />
              <span>Emitir CFE Manual</span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'emitidos', label: '1. Comprobantes Emitidos', icon: FileText, count: cfeList.length },
            { id: 'fases_api', label: '2. Fases de Integración API & JSON', icon: Code2 },
            { id: 'emitir_manual', label: '3. Emitir Comprobante', icon: Plus },
            { id: 'configuracion', label: '4. Configuración & Credenciales DGI', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-black/40 text-[10px] px-1.5 py-0.2 rounded-full ml-1 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="max-w-7xl mx-auto w-full space-y-6">

        {/* TAB 1: LISTADO DE COMPROBANTES EMITIDOS */}
        {activeTab === 'emitidos' && (
          <div className="space-y-4">
            
            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0f1c] border border-white/10 p-3 rounded-2xl">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por CFE, Cliente, RUT o CI..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Total Facturado:</span>
                <strong className="text-emerald-400 font-black text-sm">
                  ${cfeList.reduce((acc, it) => acc + it.montoTotal, 0).toLocaleString('es-UY')} UYU
                </strong>
              </div>
            </div>

            {/* CFE TABLE */}
            <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-black/60 text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Comprobante</th>
                      <th className="py-3 px-4">Fecha & Hora</th>
                      <th className="py-3 px-4">Receptor / Cliente</th>
                      <th className="py-3 px-4 text-right">Neto</th>
                      <th className="py-3 px-4 text-right">IVA (22%)</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Estado DGI</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredCFEs.map((cfe) => (
                      <tr key={cfe.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cfe.tipoCFE === '111' ? 'bg-purple-400' : 'bg-emerald-400'}`}></span>
                          <span>{cfe.numeroCFE}</span>
                          <span className="text-[9px] text-slate-400">({cfe.tipoNombre})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{cfe.fechaEmision}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white truncate max-w-[180px]">{cfe.receptorNombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {cfe.receptorRUT ? `RUT: ${cfe.receptorRUT}` : cfe.receptorCI ? `CI: ${cfe.receptorCI}` : 'Consumidor Final'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">${cfe.montoNeto.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400 font-medium">${cfe.montoIVA.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-white text-sm">${cfe.montoTotal}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                            ✓ {cfe.estadoDGI}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handlePrintCFE(cfe)}
                              title="Imprimir Ticket Térmico con CAE y QR"
                              className="p-1.5 bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white rounded-lg border border-white/10 cursor-pointer transition-all"
                            >
                              <Printer size={13} />
                            </button>

                            <a
                              href={buildWhatsAppInvoiceShareUrl('098356320', cfe)}
                              target="_blank"
                              rel="noreferrer"
                              title="Compartir Comprobante por WhatsApp"
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 cursor-pointer transition-all flex items-center justify-center"
                            >
                              <MessageSquare size={13} />
                            </a>

                            <button
                              onClick={() => setSelectedCFE(cfe)}
                              title="Ver Ficha Detallada"
                              className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg border border-blue-500/30 cursor-pointer transition-all"
                            >
                              <ExternalLink size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FASES DE INTEGRACIÓN TÉCNICA & JSON INSPECTOR */}
        {activeTab === 'fases_api' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* 4 PHASES PIPELINE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#0e1629] border border-blue-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-blue-400 font-mono text-[10px] font-bold uppercase">
                  <span>Fase 1</span>
                  <span>📦 Request</span>
                </div>
                <h4 className="font-black text-sm text-white">Estructurar la Petición</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Genera el objeto JSON estándar con Tipo de CFE (101/111), datos del emisor, receptor, desglose de ítems e IVA (10%, 22% o exento).
                </p>
              </div>

              <div className="bg-[#0e1629] border border-cyan-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-cyan-400 font-mono text-[10px] font-bold uppercase">
                  <span>Fase 2</span>
                  <span>🔌 API POST</span>
                </div>
                <h4 className="font-black text-sm text-white">Consumo de la API</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  NextCRM envía la solicitud mediante HTTP POST al endpoint seguro de Facturando.uy con autenticación por Bearer Token.
                </p>
              </div>

              <div className="bg-[#06140e] border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px] font-bold uppercase">
                  <span>Fase 3</span>
                  <span>💾 CAE & QR</span>
                </div>
                <h4 className="font-black text-sm text-white">Respuesta & Almacén</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Facturando valida con DGI, firma el CFE y devuelve el número de CAE, vencimiento, QR fiscal y link directo al PDF.
                </p>
              </div>

              <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-purple-400 font-mono text-[10px] font-bold uppercase">
                  <span>Fase 4</span>
                  <span>🚀 Producción</span>
                </div>
                <h4 className="font-black text-sm text-white">Paso a Producción</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Tras validar cálculos en Sandbox, se cambian las credenciales a Producción para emitir comprobantes legales reales.
                </p>
              </div>

            </div>

            {/* LIVE JSON INSPECTOR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* REQUEST JSON */}
              <div className="bg-[#0a0f1c] border border-blue-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-blue-400" />
                    <span className="font-bold text-white text-xs uppercase font-mono">
                      Request JSON Payload (Hacia Facturando / DGI)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                    POST /api/v1/cfe/emitir
                  </span>
                </div>

                <pre className="bg-black/80 border border-white/10 p-3.5 rounded-2xl text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[380px] custom-scrollbar leading-relaxed">
                  {JSON.stringify(lastRequestPayload, null, 2)}
                </pre>
              </div>

              {/* RESPONSE JSON */}
              <div className="bg-[#0a0f1c] border border-emerald-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-emerald-400" />
                    <span className="font-bold text-white text-xs uppercase font-mono">
                      Response JSON Payload (Desde Facturando / DGI)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    HTTP 200 OK • CAE VÁLIDO
                  </span>
                </div>

                <pre className="bg-black/80 border border-white/10 p-3.5 rounded-2xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-[380px] custom-scrollbar leading-relaxed">
                  {lastResponsePayload 
                    ? JSON.stringify(lastResponsePayload, null, 2)
                    : JSON.stringify({
                        status: "Listo para emitir",
                        mensaje: "Presiona 'Emitir CFE Manual' o cobra un pedido en Mostrador/Delivery para ver la respuesta en tiempo real.",
                        ejemploCAE: "CAE-90001234567890",
                        vencimiento: "31/12/2026",
                        estado: "ACEPTADO"
                      }, null, 2)
                  }
                </pre>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: EMISIÓN MANUAL */}
        {activeTab === 'emitir_manual' && (
          <div className="max-w-2xl mx-auto bg-[#0a0f1c] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Emisión Inmediata de Comprobante Fiscal
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">
                Emitir e-Ticket o e-Factura CFE
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresa los datos del comprobante para firmarlo y registrarlo ante DGI.
              </p>
            </div>

            {manualSuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{manualSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmitirCFE} className="space-y-4 text-xs">
              
              {/* TIPO DE CFE */}
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1.5 text-[11px]">
                  Tipo de Documento CFE:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setManualTipo('101'); setManualReceptorNombre('Consumidor Final'); setManualDoc(''); }}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      manualTipo === '101'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-black/50 text-slate-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    e-Ticket (101) • Consumidor Final
                  </button>

                  <button
                    type="button"
                    onClick={() => { setManualTipo('111'); setManualReceptorNombre('EMPRESA CLIENTE S.A.'); setManualDoc('214589320018'); }}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      manualTipo === '111'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-black/50 text-slate-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    e-Factura (111) • Con RUT de Empresa
                  </button>
                </div>
              </div>

              {/* RECEPTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                    Nombre o Razón Social:
                  </label>
                  <input
                    type="text"
                    required
                    value={manualReceptorNombre}
                    onChange={(e) => setManualReceptorNombre(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                    {manualTipo === '111' ? 'RUT Receptor (12 Dígitos):' : 'C.I. / Documento (Opcional):'}
                  </label>
                  <input
                    type="text"
                    value={manualDoc}
                    onChange={(e) => setManualDoc(e.target.value)}
                    placeholder={manualTipo === '111' ? '214589320018' : '4.892.112-9'}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* CONCEPTO Y MONTO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                    Concepto / Producto:
                  </label>
                  <input
                    type="text"
                    required
                    value={manualConcepto}
                    onChange={(e) => setManualConcepto(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                    Monto Total a Cobrar (UYU):
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={manualMontoTotal}
                    onChange={(e) => setManualMontoTotal(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                  WhatsApp del Cliente (para envío de comprobante):
                </label>
                <input
                  type="text"
                  value={manualTelefono}
                  onChange={(e) => setManualTelefono(e.target.value)}
                  placeholder="098356320"
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmittingManual}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <ShieldCheck size={16} />
                <span>{isSubmittingManual ? 'Firmando y Transmitiendo a DGI...' : `Emitir ${manualTipo === '101' ? 'e-Ticket' : 'e-Factura'} Ahora`}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CONFIGURACIÓN Y CREDENCIALES */}
        {activeTab === 'configuracion' && (
          <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Parámetros del Proveedor de Facturación</h3>
                <p className="text-xs text-slate-400">Credenciales del partner homologado Facturando.uy y series fiscales</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Ambiente:</span>
                <button
                  onClick={() => saveConfig({ ...config, ambiente: config.ambiente === 'produccion' ? 'testing' : 'produccion' })}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    config.ambiente === 'produccion'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-amber-600 text-white border-amber-400'
                  }`}
                >
                  {config.ambiente === 'produccion' ? '🚀 PRODUCCIÓN (DGI REAL)' : '🧪 TESTING / SANDBOX'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">RUT Emisor:</label>
                <input
                  type="text"
                  value={config.rut}
                  onChange={(e) => saveConfig({ ...config, rut: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Razón Social:</label>
                <input
                  type="text"
                  value={config.razonSocial}
                  onChange={(e) => saveConfig({ ...config, razonSocial: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Token de API / API Secret (Facturando.uy):</label>
                <input
                  type="password"
                  value={config.apiToken}
                  onChange={(e) => saveConfig({ ...config, apiToken: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Sucursal DGI:</label>
                <input
                  type="text"
                  value={config.sucursalDGI}
                  onChange={(e) => saveConfig({ ...config, sucursalDGI: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Serie & Próximo e-Ticket (101):</label>
                <div className="flex gap-2 font-mono">
                  <input
                    type="text"
                    value={config.serieETicket}
                    onChange={(e) => saveConfig({ ...config, serieETicket: e.target.value })}
                    className="w-16 bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                  <input
                    type="number"
                    value={config.proximoETicket}
                    onChange={(e) => saveConfig({ ...config, proximoETicket: parseInt(e.target.value) || 1 })}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">Serie & Próximo e-Factura (111):</label>
                <div className="flex gap-2 font-mono">
                  <input
                    type="text"
                    value={config.serieEFactura}
                    onChange={(e) => saveConfig({ ...config, serieEFactura: e.target.value })}
                    className="w-16 bg-black border border-white/10 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                  <input
                    type="number"
                    value={config.proximoEFactura}
                    onChange={(e) => saveConfig({ ...config, proximoEFactura: parseInt(e.target.value) || 1 })}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-white block">Emisión Automática al Cobrar:</strong>
                  <span className="text-slate-400">Genera y transmite el CFE en el momento exacto en que el cajero confirma el pago en el POS.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.autoEmitirAlCobrar}
                onChange={(e) => saveConfig({ ...config, autoEmitirAlCobrar: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
