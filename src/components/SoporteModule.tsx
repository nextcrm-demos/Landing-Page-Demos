import React, { useState } from 'react';
import { 
  Info, BookOpen, Download, Users, MessageSquare, ShieldCheck, Key, 
  FileText, CheckCircle2, DollarSign, Building, Cpu, Sparkles, Mic, 
  Headphones, HelpCircle, Check, CreditCard, Smartphone, Globe, ArrowRight, Zap, Star
} from 'lucide-react';

export function SoporteModule() {
  const [copiedPlan, setCopiedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'plan_basico',
      numero: 'Módulo 1',
      nombre: 'Plan Básico',
      precio: '$1.490',
      periodo: '/mes',
      descripcion: 'Ideal para pizzerías que inician y gestionan mostrador y delivery directo.',
      solicitudes: '1 solicitud de soporte/cambios al mes',
      destacado: false,
      color: 'border-white/10 bg-white/5',
      badgeColor: 'bg-white/10 text-slate-300',
      features: [
        'Punto de Venta POS Touch rápido',
        'Gestión de Mostrador (Take Away) y Delivery',
        'Base de Datos de Clientes y Direcciones',
        'Control de Menú, Precios y Gustos',
        'Arqueo de Caja y Cierre de Turno',
        '1 solicitud de cambio/soporte mensual',
      ],
      whatsappText: 'Hola, quisiera contratar el Plan Básico de NextCRM ($1.490/mes) para mi pizzería.',
    },
    {
      id: 'plan_pro',
      numero: 'Módulo 2',
      nombre: 'Plan Pro',
      precio: '$2.490',
      periodo: '/mes',
      descripcion: 'Agiliza la cocina y la atención al cliente con Inteligencia Artificial.',
      solicitudes: '2 solicitudes de soporte/cambios al mes',
      destacado: false,
      color: 'border-blue-500/30 bg-blue-950/20',
      badgeColor: 'bg-blue-600/30 text-blue-300 border-blue-500/40',
      features: [
        'Todo lo incluido en el Plan Básico',
        'Monitor KDS de Cocina en Tiempo Real',
        'Bandeja de Entrada WhatsApp Integrada',
        'Toma de Pedidos por Voz con IA',
        'Control de Stock e Insumos Críticos',
        'Reportes de Ventas y Productos Estrella',
        '2 solicitudes de cambios/soporte mensuales',
      ],
      whatsappText: 'Hola, quisiera contratar el Plan Pro con KDS y WhatsApp de NextCRM ($2.490/mes).',
    },
    {
      id: 'plan_vip',
      numero: 'Módulo 3',
      nombre: 'Plan VIP DGI',
      precio: '$3.490',
      periodo: '/mes',
      descripcion: 'Facturación Electrónica oficial DGI con Facturando Partner Homologado.',
      solicitudes: 'Solicitudes ILIMITADAS (Atención VIP)',
      destacado: false,
      color: 'border-emerald-500/40 bg-emerald-950/20',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      features: [
        'Todo lo incluido en el Plan Pro',
        'Facturación Electrónica DGI en Tiempo Real',
        'Partner Oficial DGI: Facturando.uy Homologado',
        'Emisión de e-Tickets (101) y e-Facturas (111)',
        'Firma digital CAE y envío automático',
        'Auditoría y Acta de Cierre General de Mes',
        'Solicitudes ILIMITADAS y soporte 24/7',
      ],
      whatsappText: 'Hola, quisiera contratar el Plan VIP con Facturación DGI de NextCRM ($3.490/mes).',
    },
    {
      id: 'plan_full',
      numero: 'Módulo 4',
      nombre: 'Plan Full Omnicanal',
      precio: '$4.490',
      periodo: '/mes',
      descripcion: 'El ecosistema completo: CRM + Tu propia Web App para pedidos online de clientes.',
      solicitudes: 'Solicitudes ILIMITADAS + Carga de Menú Bonificada',
      destacado: true,
      color: 'border-purple-500/60 bg-gradient-to-b from-purple-950/30 to-black ring-2 ring-purple-500/40',
      badgeColor: 'bg-purple-600 text-white font-black animate-pulse',
      features: [
        'TODO el CRM Full (POS, KDS, WhatsApp, Voz IA, DGI)',
        'Tu propia Web App de Pedidos (tu-pizzeria.nextcrm.uy)',
        'Tus clientes piden desde su celular sin pagar comisiones',
        'Menú Digital QR interactivo para mesas',
        'Pedidos web caen automático en POS y Cocina',
        'Carga y actualización de menú bonificada por NextCRM',
        'Atención VIP Prioritaria y Solicitudes ILIMITADAS',
      ],
      whatsappText: 'Hola, quisiera contratar el Plan Full Omnicanal con Web App de Clientes de NextCRM ($4.490/mes).',
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
          <p>Guía de uso oficial para terminales POS, KDS Cocina, WhatsApp Inbox, Pedidos por Voz con IA, Facturación DGI y App Web de Clientes.</p>
          
          <h2>1. Punto de Venta POS & Toma de Pedidos</h2>
          <p>Permite registrar ventas táctiles en 3 pasos: (1) Menú & Gustos, (2) Destino & Cliente, (3) Pago & Confirmar.</p>
          
          <h2>2. Pedidos por Voz con IA</h2>
          <p>Presiona el botón de micrófono en el POS y dicta libremente el pedido. La IA reconocerá los productos, gustos, cliente y medio de pago.</p>
          
          <h2>3. Monitor KDS de Cocina</h2>
          <p>Gestiona los pedidos organizados por Canales (Retiro, Mesas, Delivery) o por Estaciones con alertas de tiempo demorado (+30m).</p>

          <h2>4. Facturación Electrónica DGI (Facturando Partner Oficial)</h2>
          <p>Emisión instantánea de e-Tickets y e-Facturas homologadas ante DGI Uruguay.</p>

          <h2>5. Módulo Web App de Clientes</h2>
          <p>Tus clientes ordenan desde su celular a través de tu link o código QR sin intermediarios ni comisiones abusivas.</p>

          <div class="footer">
            <p>NEXT CRM — Soporte Oficial por WhatsApp: 098 356 320</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 bg-[#050505] p-4 md:p-6 overflow-y-auto relative custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <div className="bg-[#0a0f1c]/90 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Headphones size={24} />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Centro de Soporte, Manuales & Planes NextCRM
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Atención directa vía WhatsApp oficial • Tel: <strong className="text-white">098 356 320</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadManual}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download size={15} />
              <span>Descargar Manual de Usuario (PDF)</span>
            </button>

            <a
              href="https://api.whatsapp.com/send?phone=59898356320&text=Hola,%20necesito%20soporte%20t%C3%A9cnico%20para%20NextCRM."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <MessageSquare size={15} />
              <span>WhatsApp Directo (098 356 320)</span>
            </a>
          </div>
        </div>

        {/* SECTION: 4 COMMERCIAL MODULES & PLANS GRID */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-[10px] font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-widest">
              Planes Comerciales & Habilitaciones
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-wider mt-2">
              4 Módulos Diseñados para Escalar tu Negocio
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Todos los planes funcionan sobre la misma plataforma. Puedes desbloquear nuevos módulos al instante sin reinstalar nada.
            </p>
          </div>

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

                  <div className="my-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white font-mono">{plan.precio}</span>
                      <span className="text-xs text-slate-400 font-mono">{plan.periodo}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{plan.descripcion}</p>
                  </div>

                  {/* SOLICITUDES BADGE */}
                  <div className="bg-black/50 border border-white/10 p-2 rounded-xl mb-4 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5">
                    <Zap size={13} className="text-emerald-400 shrink-0" />
                    <span>{plan.solicitudes}</span>
                  </div>

                  {/* FEATURES LIST */}
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
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
                  <span>Solicitar por WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
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
    </div>
  );
}
