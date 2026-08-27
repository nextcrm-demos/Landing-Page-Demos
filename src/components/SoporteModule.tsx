import React, { useState } from 'react';
import { 
  Info, BookOpen, Download, Users, MessageSquare, ShieldCheck, Key, 
  FileText, CheckCircle2, DollarSign, Building, Cpu, Sparkles, Mic, 
  Headphones, HelpCircle, Check, CreditCard, Smartphone, Globe, ArrowRight, Zap, Star, Clock, 
  AlertTriangle, ShieldAlert, Layers, ShoppingBag, Truck, Utensils, Database, BarChart3, Wrench, Settings
} from 'lucide-react';

export function SoporteModule() {
  const [activeTab, setActiveTab] = useState<'planes' | 'contenido' | 'reportar_error' | 'garantia' | 'amedida' | 'manual'>('planes');

  // Error reporting form state
  const [errorLocalNombre, setErrorLocalNombre] = useState('Pizzería Gourmet');
  const [errorTipo, setErrorTipo] = useState('Error en Pantalla / Bloqueo');
  const [errorDetalle, setErrorDetalle] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('098356320');
  const [errorSuccess, setErrorSuccess] = useState(false);

  const handleSendErrorReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorDetalle.trim()) return;

    const text = `🚨 *REPORTE DE INCIDENCIA NEXTCRM*\n\n` +
      `🏢 *Local/Negocio:* ${errorLocalNombre}\n` +
      `⚠️ *Tipo de Incidencia:* ${errorTipo}\n` +
      `📞 *Teléfono Contacto:* ${errorTelefono}\n` +
      `📝 *Detalle del Error:*\n${errorDetalle}\n\n` +
      `⏰ *Fecha y Hora:* ${new Date().toLocaleString('es-UY')}`;

    const url = `https://api.whatsapp.com/send?phone=59898356320&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setErrorSuccess(true);
    setTimeout(() => setErrorSuccess(false), 5000);
  };

  const plans = [
    {
      id: 'plan_basico',
      numero: 'Módulo 1',
      nombre: 'Plan Básico',
      precio: '$1.490',
      periodo: 'UYU / mes',
      compraDefinitiva: '$190 USD (hasta en 6 cuotas)',
      garantiaCompraUnica: '3 Meses de Garantía y Soporte Inicial',
      descripcion: 'Ideal para pizzerías que inician y gestionan mostrador y delivery directo.',
      solicitudes: '1 solicitud mensual (o 3 meses de garantía en compra única)',
      destacado: false,
      color: 'border-white/10 bg-white/5',
      badgeColor: 'bg-white/10 text-slate-300',
      features: [
        'Punto de Venta POS Touch rápido',
        'Gestión de Mostrador (Take Away) y Delivery',
        'Impresión Térmica (impresora no incluida en hardware)',
        'Carga Inicial de Menú (por única vez)',
        'Base de Datos de Clientes y Direcciones',
        'Reporte Básico de Caja (Metros de pizza vendidos, desglose e impresión térmica)',
        'Garantía Compra Única: 3 Meses incluidos',
      ],
      whatsappText: 'Hola JPZ, quiero solicitar acceso/activación para el Módulo 1 (Plan Básico) de NextCRM ($1.490 UYU/mes ó $190 USD compra definitiva).',
    },
    {
      id: 'plan_pro',
      numero: 'Módulo 2',
      nombre: 'Plan Pro',
      precio: '$2.490',
      periodo: 'UYU / mes',
      compraDefinitiva: '$290 USD (hasta en 6 cuotas)',
      garantiaCompraUnica: '6 Meses de Garantía y Soporte Técnico',
      descripcion: 'Agiliza la cocina y la atención al cliente con Inteligencia Artificial.',
      solicitudes: '2 solicitudes mensuales (o 6 meses de garantía en compra única)',
      destacado: false,
      color: 'border-blue-500/30 bg-blue-950/20',
      badgeColor: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
      features: [
        'Todo lo incluido en el Plan Básico',
        'Monitor KDS de Cocina en Tiempo Real',
        'Bandeja de Entrada WhatsApp Integrada',
        'Toma de Pedidos por Voz con IA (API Cloud incluida)',
        'Control de Stock e Insumos Críticos',
        'Reportes de Ventas y Productos Estrella',
        'Garantía Compra Única: 6 Meses incluidos',
      ],
      whatsappText: 'Hola JPZ, quiero solicitar acceso/activación para el Módulo 2 (Plan Pro con KDS y Voz IA) de NextCRM ($2.490 UYU/mes ó $290 USD compra definitiva).',
    },
    {
      id: 'plan_vip',
      numero: 'Módulo 3',
      nombre: 'Plan VIP DGI',
      precio: '$3.490',
      periodo: 'UYU / mes',
      compraDefinitiva: '$390 USD (hasta en 6 cuotas)',
      garantiaCompraUnica: '6 Meses de Garantía y Soporte Fiscal DGI',
      descripcion: 'Facturación Electrónica oficial DGI con Facturando Partner Homologado.',
      solicitudes: 'Solicitudes ILIMITADAS (o 6 meses de soporte fiscal en compra única)',
      destacado: false,
      color: 'border-emerald-500/40 bg-emerald-950/20',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      features: [
        'Todo lo incluido en el Plan Pro',
        'Facturación Electrónica DGI en Tiempo Real',
        'Permite Integración con tu Proveedor de Facturación',
        'Emisión de e-Tickets (101) y e-Facturas (111)',
        'Firma digital CAE y envío automático',
        'Auditoría y Acta de Cierre General de Mes',
        'Garantía Compra Única: 6 Meses incluidos',
      ],
      whatsappText: 'Hola JPZ, quiero solicitar acceso/activación para el Módulo 3 (Plan VIP con Facturación DGI) de NextCRM ($3.490 UYU/mes ó $390 USD compra definitiva).',
    },
    {
      id: 'plan_full',
      numero: 'Módulo 4',
      nombre: 'Plan Full Omnicanal',
      precio: '$4.490',
      periodo: 'UYU / mes',
      compraDefinitiva: '$490 USD (hasta en 6 cuotas)',
      garantiaCompraUnica: '12 Meses (1 Año) de Garantía Total + Cloud App Clientes',
      descripcion: 'El ecosistema completo: CRM + Tu propia Web App para pedidos online de clientes.',
      solicitudes: 'Solicitudes ILIMITADAS + Carga Bonificada (o 1 año de garantía y cloud en compra única)',
      destacado: true,
      color: 'border-purple-500/60 bg-gradient-to-b from-purple-950/30 to-black ring-2 ring-purple-500/40',
      badgeColor: 'bg-purple-600 text-white font-black animate-pulse',
      features: [
        'TODO el CRM Full (POS, KDS, WhatsApp, Voz IA con API incluida, DGI)',
        'Tu propia Web App de Pedidos (tu-pizzeria.nextcrm.uy)',
        'Tus clientes piden desde su celular con GPS y sin comisiones',
        'Menú Digital QR interactivo para mesas',
        'Pedidos web caen automático en POS y Cocina',
        'Carga y actualización de menú bonificada por NextCRM',
        'Garantía Compra Única: 12 Meses (1 Año) de Servidor y Soporte VIP',
      ],
      whatsappText: 'Hola JPZ, quiero solicitar acceso/activación para el Módulo 4 (Plan Full Omnicanal con App Clientes) de NextCRM ($4.490 UYU/mes ó $490 USD compra definitiva).',
    },
  ];

  const handleDownloadManual = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Manual de Usuario y Operaciones - NEXT CRM Pizzería</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.6; max-width: 850px; margin: 0 auto; }
            h1 { color: #0f172a; border-bottom: 3px solid #2563eb; padding-bottom: 10px; font-size: 26px; }
            h2 { color: #1d4ed8; margin-top: 25px; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
            p, li { font-size: 13px; color: #334155; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 15px 0; font-size: 12px; }
            .footer { text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>NEXT CRM — Manual Integral de Operabilidad</h1>
          <p><strong>Pizzería & Restaurantes</strong> — Versión Oficial 2026</p>

          <div class="box">
            <strong>📞 Soporte Directo y Guardia Técnica:</strong> WhatsApp 098 356 320 (+598 98 356 320)<br/>
            <strong>🏢 Proveedor Oficial Facturación DGI:</strong> Facturando.uy Homologado
          </div>

          <h2>1. Apertura de Turno y Arqueo de Caja</h2>
          <p>Al iniciar la jornada, el cajero debe ingresar el efectivo inicial en caja. Durante el turno, el sistema registrará los cobros en efectivo, tarjetas de débito/crédito y transferencias. Al cerrar el turno, se genera el arqueo ciego con el desglose de ventas.</p>

          <h2>2. Operación de Mostrador (POS Touch)</h2>
          <p>Selecciona los productos del menú por categorías. Para pizzas y pizzetas puedes agregar gustos extras. Presiona 'Confirmar Cobro' para imprimir el ticket en ticketera térmica de 80mm.</p>

          <h2>3. Monitor KDS de Cocina en Tiempo Real</h2>
          <p>Los pedidos confirmados entran automáticamente a la pantalla de cocina divididos en 4 estados: Nuevos en Cola, En Preparación, Listos para Entrega y Demorados. El cocinero puede avanzar el estado con un toque.</p>

          <h2>4. Pedido por Voz con IA Paso a Paso</h2>
          <p>Presiona el micrófono y dicta producto por producto. El sistema detecta el ítem, gustos y precio. Pulsa 'Agregar a la Comanda' y repite con el siguiente producto.</p>

          <h2>5. Facturación Electrónica DGI (Facturando.uy)</h2>
          <p>Los tickets emitidos en el POS se envían de forma segura a los servidores de Facturando.uy, obteniendo el CAE oficial y código QR fiscal de DGI.</p>

          <h2>6. Póliza de Garantía y Soporte en Compra Definitiva</h2>
          <p>En modalidad de compra definitiva, el software es de propiedad perpetua del cliente. Incluye garantía inicial sin costo (3 a 12 meses según el plan). Pasado dicho plazo, las asistencias técnicas se cotizan por evento ($490 UYU) o mediante abono opcional de mantenimiento ($790 UYU/mes).</p>

          <div class="footer">
            NEXT CRM Pizzería • Desarrollado por JPZ • Montevideo, Uruguay
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-slate-100 overflow-y-auto custom-scrollbar p-4 md:p-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto w-full mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase">
                Centro Integral de Atención & Licencias
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Soporte, Módulos & Software a Medida
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consulta el contenido detallado del CRM, pólizas de garantía, solicita activación de módulos o cotiza desarrollo personalizado.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadManual}
              className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10 cursor-pointer shadow-sm"
            >
              <Download size={14} className="text-blue-400" />
              <span>Manual PDF</span>
            </button>

            <a
              href="https://api.whatsapp.com/send?phone=59898356320&text=Hola%20JPZ,%20necesito%20soporte%20t%C3%A9cnico%20para%20NextCRM%20Pizzer%C3%ADa."
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <MessageSquare size={14} />
              <span>WhatsApp Directo (098 356 320)</span>
            </a>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap gap-2 mt-4 border-b border-white/5 pb-2">
          {[
            { id: 'planes', label: '1. Planes y Módulos', icon: DollarSign },
            { id: 'contenido', label: '2. Contenido del CRM', icon: Layers },
            { id: 'reportar_error', label: '🚨 3. Reportar Error / Incidencia', icon: AlertTriangle, highlight: true },
            { id: 'garantia', label: '4. Garantía y Compra Única', icon: ShieldCheck },
            { id: 'amedida', label: '5. Software a Medida / Otros Rubros', icon: Wrench },
            { id: 'manual', label: '6. Manual de Operaciones', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : tab.highlight
                    ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={tab.highlight ? 'text-red-400' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="max-w-7xl mx-auto w-full space-y-6">

        {/* TAB 1: PLANES Y MÓDULOS */}
        {activeTab === 'planes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-5 border flex flex-col justify-between transition-all relative shadow-xl ${plan.color}`}
                >
                  {plan.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-lg border border-purple-400">
                      ★ Más Completo
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {plan.numero}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${plan.badgeColor}`}>
                        {plan.nombre}
                      </span>
                    </div>

                    <div className="my-2.5 pb-2.5 border-b border-white/10">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white font-mono">{plan.precio}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{plan.periodo}</span>
                      </div>
                      <span className="text-[10px] text-blue-300 font-bold block mt-1">
                        O Compra Única: {plan.compraDefinitiva}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">{plan.descripcion}</p>

                    {/* GARANTIA BADGE */}
                    <div className="bg-black/50 border border-white/10 p-2 rounded-xl mb-3 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                      <span>{plan.garantiaCompraUnica}</span>
                    </div>

                    {/* FEATURES LIST */}
                    <ul className="space-y-1.5 text-xs text-slate-300 mb-6">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check size={13} className="text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-tight text-[11px]">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WHATSAPP CTA BUTTON */}
                  <a
                    href={`https://api.whatsapp.com/send?phone=59898356320&text=${encodeURIComponent(plan.whatsappText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      plan.destacado
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    <MessageSquare size={14} />
                    <span>Pedir Acceso a este Módulo</span>
                  </a>
                </div>
              ))}
            </div>

            {/* SECTION: FACTURANDO PARTNER OFICIAL DGI */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-[#0a1410] to-[#040c08] border border-emerald-500/30 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck size={12} /> Facturando Partner Oficial DGI
                  </span>
                </div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">
                  Facturación Electrónica Integrada con Facturando.uy
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  NextCRM cuenta con integración nativa con <strong>Facturando</strong>, proveedor homologado oficial ante la Dirección General Impositiva (DGI Uruguay). Emite e-Tickets y e-Facturas al instante en cada cobro del POS sin necesidad de sistemas externos.
                </p>
              </div>

              <a
                href="https://api.whatsapp.com/send?phone=59898356320&text=Hola,%20quisiera%20activar%20la%20Facturaci%C3%B3n%20Electr%C3%B3nica%20DGI%20con%20Facturando%20en%20NextCRM."
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shrink-0"
              >
                <ShieldCheck size={16} />
                <span>Homologar con DGI</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: CONTENIDO DEL CRM & MÓDULOS */}
        {activeTab === 'contenido' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Arquitectura Integral del Software
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  Estructura y Contenido Completo de NextCRM
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  NextCRM está compuesto por <strong>2 Ecosistemas Principales</strong> sincronizados en tiempo real mediante base de datos en la nube.
                </p>
              </div>

              {/* 2 MAIN ECOSYSTEMS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* ECOSYSTEM 1: CRM GESTIÓN */}
                <div className="bg-[#0e1629] border border-blue-500/40 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/40">
                      <Cpu size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-blue-300 font-bold uppercase">Ecosistema 1</span>
                      <h4 className="font-black text-lg text-white">CRM de Gestión & Operaciones</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Panel interno de trabajo para el cajero, telefonista, mozos, cocineros y dueños del negocio.
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">1. Punto de Venta POS Touch:</strong>
                      Mostrador (Take Away), Delivery y Mesas en Salón con cálculo de vuelto y selección de gustos.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">2. Monitor KDS de Cocina:</strong>
                      Pantalla táctil para el chef dividida en 4 estados (Nuevos, En Preparación, Listos y Demorados).
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">3. Pedido por Voz con IA Paso a Paso:</strong>
                      El operador dicta ítem por ítem, la IA reconoce el producto y lo acumula en la comanda.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">4. Bandeja de Entrada WhatsApp:</strong>
                      Recepción y atención de pedidos directamente desde el CRM.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">5. Control de Stock & Caja:</strong>
                      Arqueo ciego por turno, desglose de cobros con tarjeta y control de insumos críticos.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">6. Facturación DGI Homologada:</strong>
                      Emisión de e-Tickets con CAE y código QR fiscal oficial mediante Facturando.uy.
                    </div>
                  </div>
                </div>

                {/* ECOSYSTEM 2: APP CLIENTES */}
                <div className="bg-[#140b24] border border-purple-500/40 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/40">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-purple-300 font-bold uppercase">Ecosistema 2</span>
                      <h4 className="font-black text-lg text-white">App Web de Clientes & Menú QR</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Portal web para que tus comensales ordenen desde su propio celular sin pagar comisiones a plataformas externas.
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">1. Menú Digital Interactivo:</strong>
                      Catálogo con categorías, fotos, selector de gustos exclusivos para pizzas y promociones.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">2. Geolocalización GPS Satelital:</strong>
                      El cliente toca 'GPS' y el sistema detecta su calle, número de puerta y barrio de forma automática.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">3. Seguimiento en Tiempo Real:</strong>
                      El comensal ve el estado exacto: 'Recibido', 'En el Horno', 'Empaquetado' y 'En Camino'.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">4. Menú QR para Mesas en Salón:</strong>
                      El cliente escanea el código QR de su mesa y la comanda viaja directo a la cocina.
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                      <strong className="text-white block">5. 0% Comisiones a Terceros:</strong>
                      Todo el valor de cada venta ingresa íntegro a tu comercio sin intermediarios.
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: REPORTAR ERROR / INCIDENCIA TECNICA */}
        {activeTab === 'reportar_error' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* HERO ALERT CARD */}
            <div className="bg-gradient-to-r from-red-950/40 via-[#180909] to-black border-2 border-red-500/50 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold text-red-300 uppercase tracking-widest bg-red-950/60 border border-red-500/40 px-3 py-0.5 rounded-full">
                      Canal de Emergencias & Soporte Prioritario
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
                    🚨 Reportar Incidencia o Falla Técnica
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Si experimentas algún error en pantalla, bloqueo, problema de impresión o de conexión, repórtalo de inmediato para que nuestro equipo técnico lo resuelva en tiempo récord.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <a
                    href="https://api.whatsapp.com/send?phone=59898356320&text=Hola%20JPZ,%20tengo%20una%20urgencia%20t%C3%A9cnica%20en%20NextCRM."
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <MessageSquare size={16} /> WhatsApp Urgente
                  </a>

                  <a
                    href="tel:+59898356320"
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                  >
                    <Headphones size={16} className="text-blue-400" /> Llamar: 098 356 320
                  </a>
                </div>
              </div>
            </div>

            {/* FORMULARIO DE REPORTE RAPIDO */}
            <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="pb-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white uppercase tracking-wide">
                    Formulario de Notificación de Incidencias
                  </h4>
                  <p className="text-xs text-slate-400">
                    Se envía directamente con los datos de tu local y el detalle técnico al WhatsApp de JPZ.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ⚡ Respuesta Inmediata
                </span>
              </div>

              {errorSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <div>
                    <strong>¡Reporte generado con éxito!</strong>
                    <p className="text-[11px] text-emerald-400/80">Se ha abierto WhatsApp para transmitir los datos de la incidencia a soporte.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendErrorReport} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                      Nombre de tu Local / Negocio *:
                    </label>
                    <input
                      type="text"
                      required
                      value={errorLocalNombre}
                      onChange={(e) => setErrorLocalNombre(e.target.value)}
                      placeholder="Ej: Pizzería Gourmet"
                      className="w-full bg-black border border-white/15 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                      Teléfono de Contacto *:
                    </label>
                    <input
                      type="text"
                      required
                      value={errorTelefono}
                      onChange={(e) => setErrorTelefono(e.target.value)}
                      placeholder="098 356 320"
                      className="w-full bg-black border border-white/15 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                      Tipo de Falla o Módulo Afectado *:
                    </label>
                    <select
                      value={errorTipo}
                      onChange={(e) => setErrorTipo(e.target.value)}
                      className="w-full bg-black border border-white/15 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="Error en Pantalla / Bloqueo">Error en Pantalla / Bloqueo</option>
                      <option value="Toma de Pedidos / Mostrador / POS">Toma de Pedidos / Mostrador / POS</option>
                      <option value="Dictado por Voz / IA">Dictado por Voz / IA</option>
                      <option value="Monitor KDS de Cocina">Monitor KDS de Cocina</option>
                      <option value="Facturación DGI / CFE">Facturación DGI / CFE</option>
                      <option value="Impresora Térmica / Vouchers">Impresora Térmica / Vouchers</option>
                      <option value="App Web de Clientes / Envíos">App Web de Clientes / Envíos</option>
                      <option value="Otro Problema">Otro Problema</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase mb-1 text-[11px]">
                    Descripción Detallada del Error o Mensaje que te aparece *:
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={errorDetalle}
                    onChange={(e) => setErrorDetalle(e.target.value)}
                    placeholder="Describe qué estabas haciendo cuando ocurrió el error, qué mensaje o pantalla te apareció, o pega aquí el texto del error..."
                    className="w-full bg-black border border-white/15 focus:border-red-500 rounded-xl p-3.5 text-white outline-none custom-scrollbar"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ⏰ Horario de Atención: Lunes a Viernes 09:00 a 17:00 hs (Guardias activas 24/7)
                  </span>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={15} /> Enviar Reporte Urgente por WhatsApp
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 4: POLÍTICAS DE GARANTÍA Y COMPRA DEFINITIVA */}
        {activeTab === 'garantia' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0a0f1c] border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              
              <div>
                <span className="text-xs font-mono font-bold text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Transparencia Total • Marco de Garantías Oficial
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  Póliza de Garantía, Vigencia y Soporte Post-Venta
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Para brindar tranquilidad y seguridad a tu inversión, definimos con precisión qué cubre cada modalidad y qué sucede al vencer el tiempo de garantía.
                </p>
              </div>

              {/* COMPARATIVE CARDS: MENSUAL VS COMPRA DEFINITIVA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* MODALIDAD MENSUAL */}
                <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Clock size={16} className="text-blue-400" /> Modalidad Mensual (Suscripción)
                    </h4>
                    <span className="text-[10px] font-mono bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                      Servicio Continuo
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Soporte Técnico Continuo:</strong> Cubierto mes a mes mientras el abono esté activo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Actualizaciones de Software:</strong> Acceso a mejoras y parches de seguridad automáticos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Backups y Nube:</strong> Sincronización continua de datos e historial de caja.</span>
                    </li>
                  </ul>
                </div>

                {/* MODALIDAD COMPRA DEFINITIVA */}
                <div className="bg-gradient-to-b from-blue-950/20 to-black border border-blue-500/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" /> Compra Definitiva (Pago Único)
                    </h4>
                    <span className="text-[10px] font-mono bg-emerald-600/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Licencia Perpetua
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Propiedad Perpetua:</strong> El software es 100% tuyo. No caduca ni se bloquea.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Financiación Flexible:</strong> Puedes abonarlo en hasta 6 pagos.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Garantía Inicial Bonificada:</strong> De 3 a 12 meses de soporte técnico cubierto según el módulo.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* TIMELINE OF WARRANTY PER MODULE */}
              <div>
                <h4 className="font-bold text-sm text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap size={15} className="text-amber-400" /> Tiempo de Garantía y Soporte Incluido por Módulo (Compra Única):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  
                  <div className="bg-[#0e1629] border border-white/10 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Módulo 1: Básico ($190 USD)</span>
                    <h5 className="font-black text-base text-white">3 Meses de Garantía</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Puesta en marcha, configuración inicial de impresora térmica e inducción al cajero.
                    </p>
                  </div>

                  <div className="bg-[#0e1629] border border-blue-500/30 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-mono text-blue-300 uppercase font-bold">Módulo 2: Pro ($290 USD)</span>
                    <h5 className="font-black text-base text-white">6 Meses de Garantía</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Asistencia técnica en Monitor KDS de Cocina, enlace de WhatsApp y configuración de voz IA.
                    </p>
                  </div>

                  <div className="bg-[#06140e] border border-emerald-500/30 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">Módulo 3: VIP DGI ($390 USD)</span>
                    <h5 className="font-black text-base text-white">6 Meses de Garantía Fiscal</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Soporte de homologación ante DGI, vinculación con Facturando.uy y resolución de firmas CAE.
                    </p>
                  </div>

                  <div className="bg-purple-950/20 border border-purple-500/40 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-mono text-purple-300 uppercase font-bold">Módulo 4: Full ($490 USD)</span>
                    <h5 className="font-black text-base text-white">12 Meses (1 Año) Total</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Alojamiento en la nube de la App Web Clientes cubierto por 1 año, carga inicial de menú y soporte VIP.
                    </p>
                  </div>

                </div>
              </div>

              {/* WHAT HAPPENS AFTER WARRANTY EXPIRES */}
              <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <HelpCircle size={18} />
                  <h4 className="font-bold text-sm text-white uppercase tracking-wide">
                    ¿Qué sucede una vez finalizado el tiempo de garantía en Compra Definitiva?
                  </h4>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  El sistema <strong>continúa funcionando de por vida en tu local</strong> sin cobros automáticos ni bloqueos. Si con el tiempo necesitas asistencia técnica por cambio de computadora o formateo, puedes elegir entre:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-[#0a0f1c] border border-white/10 p-3.5 rounded-xl space-y-1">
                    <span className="text-emerald-400 font-black text-xs block">Opción A: Soporte Puntual por Evento</span>
                    <p className="text-slate-300">
                      <strong>$490 UYU por intervención:</strong> Pagas únicamente si solicitas asistencia puntual (ej: reinstalación de ticketera por formateo o cambio de PC).
                    </p>
                  </div>

                  <div className="bg-[#0a0f1c] border border-white/10 p-3.5 rounded-xl space-y-1">
                    <span className="text-blue-400 font-black text-xs block">Opción B: Abono de Mantenimiento Opcional</span>
                    <p className="text-slate-300">
                      <strong>$790 UYU / mes (opcional):</strong> Cubre soporte ilimitado por WhatsApp, resguardo diario de base de datos en la nube y nuevas actualizaciones.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SOFTWARE A MEDIDA Y OTROS RUBROS */}
        {activeTab === 'amedida' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-b from-blue-950/30 via-[#0a0f1c] to-black border border-blue-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Desarrollo de Software Personalizado
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  ¿Necesitas un Software a Medida o para otro Rubro?
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  NextCRM es una plataforma modular y flexible. Si tu negocio requiere funciones exclusivas, flujos especiales o pertenece a otro sector comercial, desarrollamos la solución exacta a tu medida.
                </p>
              </div>

              {/* RUBROS ADAPTABLES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[
                  { title: '🍔 Hamburgueserías & Lomiterías', desc: 'Combos personalizados, aderezos dinámicos y comandas directas a plancha/freidora.' },
                  { title: '🍣 Sushi & Comida Asiática', desc: 'Control de piezas, combinados especiales, salsas y tiempos estrictos de elaboración.' },
                  { title: '☕ Cafeterías & Panaderías', desc: 'Venta rápida por mostrador, combos de desayuno/merienda y control de mermas.' },
                  { title: '📦 Distribuidoras & Mayoristas', desc: 'Listas de precios diferenciales por cliente, cuentas corrientes y control de stock masivo.' },
                  { title: '🛒 Comercios Minoristas (Retail)', desc: 'Lectura de código de barras, facturación rápida y control de inventario por código.' },
                  { title: '⚙️ Funciones Exclusivas a Medida', desc: 'Integración con balanzas electrónicas, pasarelas de pago, APIs externas o apps móviles personalizadas.' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#0e1629] border border-white/10 rounded-2xl p-4 space-y-1.5">
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* CTA BOX */}
              <div className="bg-black/60 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-base text-white uppercase tracking-wide">
                    Solicita tu Cotización para Software a Medida
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Cuéntanos qué necesita tu negocio y te armamos una propuesta técnica y económica personalizada.
                  </p>
                </div>

                <a
                  href="https://api.whatsapp.com/send?phone=59898356320&text=Hola%20JPZ,%20quisiera%20solicitar%20una%20cotizaci%C3%B3n%20para%20un%20software%20a%20medida%20o%20adaptaci%C3%B3n%20a%20otro%20rubro."
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span>Cotizar Proyecto por WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: GUIA DE OPERACIONES */}
        {activeTab === 'manual' && (
          <div className="bg-[#0a0f1c] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Guía Rápida de Operaciones</h3>
                <p className="text-xs text-slate-400">Instrucciones clave para el personal de mostrador y cocina</p>
              </div>
              <button
                onClick={handleDownloadManual}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download size={13} /> Imprimir Manual PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <CreditCard size={15} className="text-blue-400" /> 1. Cobro en Mostrador
                </h4>
                <p>
                  Ingresa al módulo Mostrador/POS, selecciona la categoría, pulsa el producto y elige 'Confirmar Cobro'. Puedes imprimir ticket térmico o enviar ticket digital.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Cpu size={15} className="text-emerald-400" /> 2. Monitor KDS Cocina
                </h4>
                <p>
                  Visualiza los pedidos entrantes clasificados por tiempo. Toca 'En Preparación' al meter al horno y 'Listo para Entrega' al empaquetar la pizza.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Mic size={15} className="text-purple-400" /> 3. Pedido por Voz
                </h4>
                <p>
                  Presiona el micrófono y dicta ítem por ítem. Revisa que el gusto esté correcto, pulsa 'Agregar a la Comanda' y confirma el envío a cocina.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
