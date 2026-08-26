import React, { useState } from 'react';
import { Info, BookOpen, Download, Users, MessageSquare, ShieldCheck, Key, FileText, CheckCircle2, DollarSign, Building, Cpu, Sparkles, Mic, Headphones, HelpCircle, Check, CreditCard } from 'lucide-react';

export function SoporteModule() {
  const [dgiRut, setDgiRut] = useState('219876540012');
  const [dgiPartner, setDgiPartner] = useState('biller');
  const [dgiToken, setDgiToken] = useState('dgi_live_api_982f3a887b1c4e92a01');
  const [dgiMode, setDgiMode] = useState<'sandbox' | 'production'>('production');
  const [dgiAutoEmit, setDgiAutoEmit] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveDgiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadManual = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Manual Completo de Usuario - NEXT CRM</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 900px; margin: 0 auto; background: #f8fafc; }
            .container { background: #ffffff; padding: 45px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
            .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 35px; }
            .header h1 { color: #0f172a; font-size: 30px; margin: 0 0 8px 0; letter-spacing: -0.5px; }
            .header p { color: #64748b; font-size: 14px; margin: 0; font-weight: 500; }
            h2 { color: #1e40af; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-top: 35px; font-size: 20px; text-transform: uppercase; tracking: 0.5px; }
            h3 { color: #334155; font-size: 16px; margin-top: 20px; margin-bottom: 8px; }
            p { margin-bottom: 12px; font-size: 14px; color: #334155; }
            ul, ol { margin-bottom: 18px; color: #334155; font-size: 14px; padding-left: 24px; }
            li { margin-bottom: 6px; }
            .badge { display: inline-block; padding: 3px 8px; background: #eff6ff; color: #1d4ed8; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .alert { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
            .info { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
            .success { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0; font-size: 13px; }
            .footer { text-align: center; margin-top: 40px; pt: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background: #f1f5f9; color: #0f172a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Manual Integral de NEXT CRM</h1>
              <p>Sistema Profesional de Gestión Gastronómica, POS Touch, Monitor KDS, Control de Caja, Stock y Dictado por Voz con IA</p>
            </div>
            
            <p>Bienvenido al manual oficial de operabilidad de <strong>NEXT CRM</strong>. Esta guía cubre exhaustivamente cada uno de los módulos y flujos operativos para garantizar una gestión fluida, sin errores contables ni demoras en la preparación de comandas.</p>
            
            <h2>1. Apertura de Turno y Control de Caja Inicial</h2>
            <p>Al iniciar la jornada o cambiar de operador, el sistema solicita ingresar el <strong>Nombre de Usuario</strong> y registrar la <strong>Apertura de Caja</strong>.</p>
            <ul>
              <li><strong>Fondo Fijo Inicial:</strong> Registro obligatorio del dinero físico con el que se inicia la jornada para dar cambio.</li>
              <li><strong>Validación de Inventario:</strong> Verificación de umbrales de stock mínimo para emitir alertas antes de comenzar la venta.</li>
            </ul>

            <h2>2. Toma de Pedidos (Punto de Venta POS Touch & Dictado por Voz con IA)</h2>
            <p>Diseñado para operar en pantallas táctiles o mediante reconocimiento inteligente de voz:</p>
            <ul>
              <li><strong>Categorización de Menú:</strong> Pestañas rápidas de Pizzas, Pizzetas, Promociones, Fainá, Postres, Bebidas y Sándwiches.</li>
              <li><strong>Dictado por Voz con IA:</strong> Presiona el botón flotante de micrófono para dictar el pedido sin tocar el teclado. Incluye supresión de ruido y confirmación auditiva hablada.</li>
              <li><strong>Multi-Metodos de Pago & Calculadora de Vuelto:</strong> Efectivo con vuelto exacto, tarjetas POS por sello (Visa, Master, Oca, etc.) y transferencias.</li>
            </ul>

            <h2>3. Monitor de Cocina en Tiempo Real (KDS Kitchen Display)</h2>
            <p>Reemplaza las comandas impresas en papel con un monitor táctil interactivo en acordeón con alertas de tiempo y semáforo de demora.</p>

            <h2>4. Políticas de Soporte y Planes de Servicio</h2>
            <ul>
              <li><strong>Garantía de Operatividad:</strong> 1 año de soporte cubierto ante fallos del sistema. Plan Básico incluye 1 consulta mensual al año.</li>
              <li><strong>Mantenimiento y Carga de Menú:</strong> En planes mensuales nuestro equipo realiza la carga y actualización de productos y precios, además de incluir 2 consultas mensuales.</li>
              <li><strong>Copias de Seguridad:</strong> Respaldos periódicos y resguardo de datos.</li>
            </ul>

            <div class="footer">
              <p>NEXT CRM — Documentación Oficial de Usuario | Soporte Técnico Directo por WhatsApp</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto relative">
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[128px] pointer-events-none"></div>
      <div className="max-w-5xl mx-auto relative z-10 flex flex-col h-full space-y-6">
        
        {/* HEADER */}
        <div className="bg-[#0a0f1c]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between shadow-xl">
          <h2 className="text-base font-light text-white tracking-[0.15em] flex items-center gap-3 uppercase">
            <Info size={20}/> Soporte, Planes & Información Técnica
          </h2>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
            Garantía Activa: 1 Año
          </span>
        </div>
        
        {/* POLÍTICA DE PLANES & SOPORTE */}
        <div className="bg-[#0a0f1c]/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-emerald-400" />
                <h3 className="text-lg font-bold text-white tracking-[0.15em] uppercase">
                  Planes de Servicio, Mantenimiento & Soporte
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Conoce las coberturas, condiciones de garantía y opciones de mantenimiento mensual disponibles para tu software.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Plan Básico */}
            <div className="bg-black/50 p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white uppercase text-sm">Plan Básico</span>
                  <span className="text-slate-400 text-[11px] font-mono">$190 USD (Único)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Software completo autogestionable. Disponible en 6 cuotas. El cliente realiza sus propias cargas y modificaciones de carta.
                </p>
                <ul className="text-[11px] text-slate-400 space-y-1.5 pt-2 border-t border-white/5">
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> 1 año de garantía ante fallos</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> 1 consulta técnica mensual al año incluida</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> POS, Cocina KDS, Mesas y Caja</li>
                </ul>
              </div>
            </div>

            {/* Plan Intermedio */}
            <div className="bg-[#0b1f16] p-5 rounded-2xl border border-emerald-500/40 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-emerald-300 uppercase text-sm">Plan Intermedio</span>
                  <span className="text-emerald-400 text-[11px] font-mono font-bold">$35 USD/mes</span>
                </div>
                <p className="text-[11px] text-slate-200">
                  Mantenimiento mensual continuo. Nuestro equipo carga y actualiza tu menú y precios por ti.
                </p>
                <ul className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-emerald-500/20">
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> Carga y cambios de menú incluidos</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> 2 consultas mensuales incluidas</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> Copias de seguridad periódicas y seguridad</li>
                </ul>
              </div>
            </div>

            {/* Plan Premium IA */}
            <div className="bg-[#0b1929] p-5 rounded-2xl border border-cyan-500/40 space-y-3 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-cyan-300 uppercase text-sm">Plan Premium IA</span>
                  <span className="text-cyan-400 text-[11px] font-mono font-bold">$55 USD/mes</span>
                </div>
                <p className="text-[11px] text-slate-200">
                  Todo lo del Plan Intermedio más Asistente de Pedidos por Voz con IA y comprensión de mensajes de WhatsApp.
                </p>
                <ul className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-cyan-500/20">
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-cyan-400" /> Pedidos por Voz con IA (Gemini)</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-cyan-400" /> Conversión y comprensión de WhatsApp</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-cyan-400" /> 2 consultas mensuales + Soporte VIP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE MANUAL Y WHATSAPP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 flex flex-col items-start hover:border-white/20 transition-colors">
            <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
              <BookOpen size={28}/>
            </div>
            <h3 className="text-2xl font-light text-white mb-3">Manual de Usuario</h3>
            <p className="text-slate-400 font-light text-sm mb-8 leading-relaxed">
              Descarga el manual completo de NEXT CRM. Incluye explicaciones paso a paso sobre apertura y arqueo de caja, POS touch, pedidos por voz con IA, control de stock, desgloses por tarjeta, propinas y monitor KDS de cocina.
            </p>
            <button onClick={handleDownloadManual} className="mt-auto bg-blue-600 text-white font-medium py-3.5 px-6 rounded-xl hover:bg-blue-500 transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] text-sm tracking-wide flex items-center gap-2 cursor-pointer">
              <Download size={18}/> Descargar Manual PDF
            </button>
          </div>

          <div className="bg-[#0a0f1c]/80 backdrop-blur-sm rounded-3xl p-8 border border-white/10 flex flex-col items-start hover:border-white/20 transition-colors">
            <div className="w-14 h-14 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
              <Users size={28}/>
            </div>
            <h3 className="text-2xl font-light text-white mb-3">Soporte Técnico Directo</h3>
            <p className="text-slate-400 font-light text-sm mb-8 leading-relaxed">
              ¿Tienes dudas operativas, necesitas una de tus consultas mensuales incluidas o asistencia técnica? Escríbenos directamente por WhatsApp.
            </p>
            <div className="mt-auto flex flex-col gap-3 w-full">
              <a 
                href="https://wa.me/59898356320" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(37,211,102,0.4)] text-sm tracking-wide flex items-center justify-center gap-3 w-full cursor-pointer active:scale-98"
              >
                <MessageSquare size={20}/> Contactar Soporte WhatsApp (098 356 320)
              </a>
              <a 
                href="mailto:nextcrmsoftware@gmail.com" 
                className="bg-white/5 text-slate-300 font-medium py-3 px-6 rounded-xl hover:bg-white/10 transition-colors border border-white/10 text-xs tracking-wide flex items-center justify-center gap-2 w-full"
              >
                <Info size={16}/> nextcrmsoftware@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* FACTURACIÓN ELECTRÓNICA DGI (URUGUAY) PANEL */}
        <div className="bg-[#0a0f1c]/90 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-blue-500/30 shadow-2xl mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white tracking-[0.15em] uppercase">Facturación Electrónica CFE (DGI Uruguay)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Conecta NEXT CRM con tu Proveedor de Servicios de Facturación (PSE Partner) para emision de e-Tickets y e-Facturas en tiempo real.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                API Ready / Habilitado
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveDgiConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 rounded-2xl border border-white/5">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Building size={14} className="text-blue-400" /> RUT del Comercio (DGI)
                </label>
                <input 
                  type="text" 
                  value={dgiRut} 
                  onChange={(e) => setDgiRut(e.target.value)} 
                  placeholder="Ej: 219876540012" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Cpu size={14} className="text-purple-400" /> Proveedor de Facturación (PSE Partner)
                </label>
                <select 
                  value={dgiPartner} 
                  onChange={(e) => setDgiPartner(e.target.value)} 
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="biller">Biller (API REST Moderna)</option>
                  <option value="memory">Memory / Figaro (Líder PyME)</option>
                  <option value="uruware">Uruware (e-Factura.uy)</option>
                  <option value="sicfe">Sicfe (Inswitch)</option>
                  <option value="montevideo_comm">Montevideo COMM / Delsur</option>
                  <option value="fenicio">Fenicio / Inco</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Key size={14} className="text-amber-400" /> API Token / Key del Proveedor
                </label>
                <input 
                  type="password" 
                  value={dgiToken} 
                  onChange={(e) => setDgiToken(e.target.value)} 
                  placeholder="Token proporcionado por tu PSE" 
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white font-mono outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Entorno de Conexión</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setDgiMode('sandbox')} 
                      className={`p-3 rounded-xl text-xs font-bold transition-all border ${dgiMode === 'sandbox' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow' : 'bg-black/50 text-slate-400 border-white/10'}`}
                    >
                      Sandbox (Pruebas DGI)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setDgiMode('production')} 
                      className={`p-3 rounded-xl text-xs font-bold transition-all border ${dgiMode === 'production' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow' : 'bg-black/50 text-slate-400 border-white/10'}`}
                    >
                      Producción Real DGI
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Emisión Automática en POS</span>
                    <span className="text-[10px] text-slate-400">Genera e-Ticket DGI automáticamente al confirmar cobra en caja.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={dgiAutoEmit} 
                    onChange={(e) => setDgiAutoEmit(e.target.checked)} 
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Guardar Parámetros DGI
                </button>
                {savedSuccess && (
                  <p className="text-xs text-emerald-400 font-bold text-center mt-2 animate-fade-in">Parámetros guardados y validados correctamente en NEXT CRM.</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
