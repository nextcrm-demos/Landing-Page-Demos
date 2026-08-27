import { Order, MonthlyClosing } from '../types';


export const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printTableReport = (title: string, headers: string[], rows: (string | number)[][]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>${title} - NEXT CRM</h1>
        <p>Fecha de emisión: ${new Date().toLocaleString()}</p>
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};

export const printTicket = (orderToPrint: Order | null, triggerAlert?: (msg: string) => void) => {
  if (!orderToPrint) return;
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    if (triggerAlert) triggerAlert('Habilita las ventanas emergentes para imprimir.');
    return;
  }

  const isCard = ['tarjeta', 'debito', 'credito'].includes(orderToPrint.pago.metodo);

  const generateTicketHTML = (isClientCopy: boolean) => `
    <div style="width: 100%; max-width: 80mm; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000; padding: 0 5px;">
      
      <h1 style="text-align: center; margin: 0 0 5px 0; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">NEXT CRM</h1>
      <p style="text-align: center; margin: 0; font-size: 16px; font-weight: 900;">Demo Pizzería</p>
      <p style="text-align: center; margin: 0; font-size: 14px; font-weight: bold;">RUT: 219999990011</p>
      <p style="text-align: center; margin: 0 0 10px 0; font-size: 12px; font-weight: bold;">Tel: 099 123 456 - Dir: Av. Principal 123</p>
      
      <div style="background-color: #000; color: #fff; text-align: center; font-size: 14px; font-weight: bold; padding: 5px; margin: 10px 0; border-radius: 4px;">
         *** COPIA ${isClientCopy ? 'CLIENTE' : 'COMERCIO'} ***
      </div>

      <div style="text-align: center; margin: 10px 0; font-size: 22px; font-weight: 900; border: 3px solid #000; padding: 5px;">
         ORDEN #${orderToPrint.id}
      </div>
      
      <table style="width: 100%; font-size: 12px; margin-bottom: 10px; font-weight: bold;">
        <tr><td style="color: #555; width: 75px;">FECHA:</td><td style="text-align: right;">${new Date().toLocaleDateString()}</td></tr>
        <tr><td style="color: #555;">H. PEDIDO:</td><td style="text-align: right;">${orderToPrint.horaPedido || orderToPrint.fecha}</td></tr>
        ${orderToPrint.horaListo ? `<tr><td style="color: #555;">H. LISTO:</td><td style="text-align: right;">${orderToPrint.horaListo}</td></tr>` : ''}
        ${orderToPrint.horaEntregado ? `<tr><td style="color: #555;">H. ENTREGA:</td><td style="text-align: right;">${orderToPrint.horaEntregado}</td></tr>` : ''}
        <tr><td style="color: #555;">MODALIDAD:</td><td style="text-align: right; text-transform: uppercase;">${orderToPrint.pago.tipo}</td></tr>
        
        <tr><td colspan="2" style="border-top: 1px dashed #ccc; margin-top: 5px; padding-top: 5px;"></td></tr>
        
        <tr><td style="color: #555; vertical-align: top;">CLIENTE:</td><td style="text-align: right; text-transform: uppercase; font-size: 18px; font-weight: 900; color: #000; line-height: 1.1;">${orderToPrint.cliente.nombre || 'MOSTRADOR'}</td></tr>
        ${orderToPrint.cliente.telefono ? `<tr><td style="color: #555; vertical-align: top;">TEL:</td><td style="text-align: right; font-size: 16px; font-weight: 900; color: #000;">${orderToPrint.cliente.telefono}</td></tr>` : ''}
        ${orderToPrint.cliente.direccion ? `<tr><td style="color: #555; vertical-align: top;">DIR:</td><td style="text-align: right; font-size: 16px; font-weight: 900; color: #000; line-height: 1.1;">${orderToPrint.cliente.direccion}</td></tr>` : ''}
        ${orderToPrint.cliente.mesa ? `<tr><td style="color: #555;">MESA:</td><td style="text-align: right; font-size: 18px; font-weight: 900; color: #000;">${orderToPrint.cliente.mesa}</td></tr>` : ''}
        
        <tr><td colspan="2" style="border-top: 1px dashed #ccc; margin-top: 5px; padding-top: 5px;"></td></tr>
        
        <tr><td style="color: #555;">PAGO:</td><td style="text-align: right; text-transform: uppercase;">${orderToPrint.pago.metodo}</td></tr>
      </table>
      
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 10px;">
        <thead>
          <tr style="border-bottom: 2px solid #000;">
             <th style="padding-bottom: 5px; font-size: 11px; width: 15%;">CANT</th>
             <th style="padding-bottom: 5px; font-size: 11px;">DESCRIPCIÓN</th>
             <th style="padding-bottom: 5px; font-size: 11px; text-align: right;">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          ${orderToPrint.cart.map(item => `
            <tr>
              <td style="padding: 8px 0; vertical-align: top; font-size: 16px; font-weight: 900;">${item.cantidad}</td>
              <td style="padding: 8px 5px 8px 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                ${item.nombre}
                ${item.notas ? `<br><span style="font-size: 12px; font-weight: normal; font-style: italic;">+ ${item.notas}</span>` : ''}
              </td>
              <td style="padding: 8px 0; text-align: right; vertical-align: top; font-size: 14px; font-weight: bold;">$${item.precio * item.cantidad}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="border-top: 3px solid #000; margin: 10px 0;"></div>
      <div style="display: flex; justify-content: space-between; font-size: 24px; font-weight: 900; margin-bottom: 10px;">
         <span>TOTAL</span>
         <span>$${orderToPrint.total}</span>
      </div>
      
      ${isCard && !isClientCopy ? `
      <div style="border: 3px dashed #000; padding: 10px; text-align: center; margin: 15px 0; border-radius: 4px;">
         <h2 style="margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase;">¡ENVIAR POS!</h2>
         <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Pago con ${orderToPrint.pago.metodo}</p>
      </div>
      ` : ''}
      
      ${orderToPrint.pago.notas ? `
      <div style="border: 2px solid #000; padding: 8px; margin: 10px 0; border-radius: 4px;">
         <p style="margin: 0; font-size: 12px; font-weight: 900; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px;">NOTAS DEL PEDIDO:</p>
         <p style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">${orderToPrint.pago.notas}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 20px;">
         <p style="font-size: 10px; font-weight: bold; margin: 0;">|| |||| || ||| || |||||| | |||</p>
         <p style="font-size: 12px; font-weight: bold; margin: 5px 0 0 0;">¡GRACIAS POR ELEGIRNOS!</p>
      </div>
    </div>
  `;

  const htmlContent = `
    <html>
      <head>
        <title>Ticket #${orderToPrint.id}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 10px 0; background: #fff; }
          .page-break { page-break-after: always; display: block; height: 1px; margin: 15px 0; border-bottom: 1px dashed #ccc; }
        </style>
      </head>
      <body>
        ${generateTicketHTML(true)}
        <div class="page-break"></div>
        ${generateTicketHTML(false)}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const printCierreTurnoThermalTicket = (params: {
  cajero: string;
  openingCash: string;
  dailyOrders: Order[];
  totals: {
    efectivo: number;
    debito: number;
    credito: number;
    transferencia: number;
    a_confirmar: number;
    total_ventas: number;
    total_propinas: number;
  };
  triggerAlert?: (msg: string) => void;
}) => {
  const { cajero, openingCash, dailyOrders, totals, triggerAlert } = params;
  const printWindow = window.open('', '_blank', 'width=420,height=750');
  if (!printWindow) {
    if (triggerAlert) triggerAlert('Habilita las ventanas emergentes para imprimir el ticket de cierre.');
    return;
  }

  const baseNum = Number(openingCash) || 0;
  const efectivoTotalFisico = baseNum + totals.efectivo;
  const cantComandas = dailyOrders.length;
  const ticketPromedio = cantComandas > 0 ? Math.round(totals.total_ventas / cantComandas) : 0;

  // Calculate items sold
  let totalMetros = 0;
  let totalPizzetas = 0;
  let totalFainas = 0;
  let totalBebidas = 0;

  dailyOrders.forEach(o => {
    o.cart.forEach(item => {
      const n = item.nombre.toLowerCase();
      if (n.includes('metro') || n.includes('1/2 metro')) {
        totalMetros += (n.includes('1/2') ? 0.5 : 1) * item.cantidad;
      } else if (n.includes('pizzeta') || n.includes('porcion') || n.includes('porción')) {
        totalPizzetas += item.cantidad;
      } else if (n.includes('faina') || n.includes('fainá')) {
        totalFainas += item.cantidad;
      } else if (n.includes('coca') || n.includes('refresco') || n.includes('cerveza') || n.includes('agua') || n.includes('salus')) {
        totalBebidas += item.cantidad;
      }
    });
  });

  const now = new Date();
  const fechaHora = now.toLocaleDateString('es-UY') + ' ' + now.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket de Cierre de Caja - NEXT CRM</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', Courier, monospace, Arial; 
            margin: 0; 
            padding: 10px 8px; 
            color: #000; 
            font-size: 12px; 
            line-height: 1.35;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .black-box { 
            background: #000; 
            color: #fff; 
            padding: 6px; 
            text-align: center; 
            font-weight: 900; 
            font-size: 14px; 
            margin: 8px 0; 
            border-radius: 4px;
          }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-top: 2px solid #000; margin: 8px 0; }
          .flex { display: flex; justify-content: space-between; margin: 2px 0; }
          .kpi-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 900; margin: 4px 0; }
          .sub { font-size: 10px; color: #444; }
          .sig-line { border-top: 1px solid #000; margin-top: 35px; padding-top: 4px; text-align: center; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin: 0; font-size: 20px; font-weight: 900; letter-spacing: 1px;">NEXT CRM</h2>
          <p style="margin: 2px 0; font-size: 13px; font-weight: bold;">PIZZERÍA ARTESANAL</p>
          <p class="sub" style="margin: 0;">RUT 219876540019 • TEL: 098 356 320</p>
        </div>

        <div class="black-box">
          *** ACTA DE CIERRE DE CAJA ***
        </div>

        <div class="flex"><span>FECHA/HORA:</span><span class="bold">${fechaHora}</span></div>
        <div class="flex"><span>CAJERO/A:</span><span class="bold">${cajero || 'Admin'}</span></div>
        <div class="flex"><span>TERMINAL:</span><span class="bold">POS 01 - MOSTRADOR</span></div>

        <div class="double-divider"></div>

        <div class="center bold" style="font-size: 12px; margin-bottom: 4px;">RESUMEN OPERATIVO DE VENTAS</div>
        <div class="kpi-row"><span>TOTAL FACTURADO:</span><span>$${totals.total_ventas.toLocaleString()}</span></div>
        <div class="flex"><span>COMANDAS TOTALES:</span><span class="bold">${cantComandas}</span></div>
        <div class="flex"><span>TICKET PROMEDIO:</span><span class="bold">$${ticketPromedio}</span></div>
        <div class="flex"><span>TOTAL PROPINAS:</span><span class="bold">$${totals.total_propinas.toLocaleString()}</span></div>

        <div class="divider"></div>

        <div class="center bold" style="font-size: 12px; margin-bottom: 4px;">METROS & PRODUCTOS VENDIDOS</div>
        <div class="flex"><span>Metros de Pizza:</span><span class="bold">${totalMetros} mts</span></div>
        <div class="flex"><span>Pizzetas / Porciones:</span><span class="bold">${totalPizzetas} u.</span></div>
        <div class="flex"><span>Porciones de Fainá:</span><span class="bold">${totalFainas} u.</span></div>
        <div class="flex"><span>Bebidas & Refrescos:</span><span class="bold">${totalBebidas} u.</span></div>

        <div class="double-divider"></div>

        <div class="center bold" style="font-size: 12px; margin-bottom: 4px;">DESGLOSE DE MEDIOS DE PAGO</div>
        <div class="flex"><span>Caja Base Inicial:</span><span>$${baseNum.toLocaleString()}</span></div>
        <div class="flex"><span>Ingreso Efectivo Turno:</span><span>$${totals.efectivo.toLocaleString()}</span></div>
        <div class="kpi-row" style="background: #eee; padding: 3px;">
          <span>EFECTIVO FÍSICO EN CAJÓN:</span>
          <span>$${efectivoTotalFisico.toLocaleString()}</span>
        </div>
        
        <div class="divider"></div>
        <div class="flex"><span>Tarjeta Débito (POS):</span><span class="bold">$${totals.debito.toLocaleString()}</span></div>
        <div class="flex"><span>Tarjeta Crédito (POS):</span><span class="bold">$${totals.credito.toLocaleString()}</span></div>
        <div class="flex"><span>Transferencias / QR:</span><span class="bold">$${totals.transferencia.toLocaleString()}</span></div>
        ${totals.a_confirmar > 0 ? `<div class="flex"><span>A Confirmar (Mesas):</span><span class="bold">$${totals.a_confirmar.toLocaleString()}</span></div>` : ''}

        <div class="double-divider"></div>

        <div class="sig-line">
          Firma Cajero/a: <strong>${cajero || 'Admin'}</strong>
        </div>
        <div class="sig-line" style="margin-top: 25px;">
          Firma Responsable / Auditoría
        </div>

        <p class="center sub" style="margin-top: 15px;">*** SOFTWARE GASTRONÓMICO NEXT CRM ***</p>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const printMonthlyClosingStatement = (closing: MonthlyClosing) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const topItemsHTML = (closing.productosMasVendidos || []).map((item, idx) => `
    <tr>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${idx + 1}. ${item.nombre}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.cantidad} uds</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  const consumptionHTML = Object.entries(closing.consumoFisico || {}).map(([key, val]) => `
    <tr>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${key}</td>
      <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${val}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Acta de Cierre Mensual - ${closing.mesNombre}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.4; font-size: 13px; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin: 3px 0 0 0; }
          .badge { background: #0f172a; color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .kpi-title { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .kpi-val { font-size: 20px; font-weight: 800; color: #0f172a; }
          .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-left: 3px solid #2563eb; padding-left: 8px; margin: 18px 0 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
          th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .signatures { display: flex; justify-content: space-around; margin-top: 40px; padding-top: 30px; }
          .sig-box { text-align: center; width: 200px; border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 11px; font-weight: 600; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">NEXT CRM - PIZZERÍA</h1>
            <p class="subtitle">INFORME EJECUTIVO & ACTA DE CIERRE GENERAL DE MES</p>
            <p class="subtitle"><strong>Período:</strong> ${closing.mesNombre} | <strong>Fecha de Cierre:</strong> ${closing.fechaCierre}</p>
          </div>
          <div style="text-align: right;">
            <span class="badge">Cierre General Auditado</span>
            <p style="font-size: 11px; color: #64748b; margin-top: 8px;">ID Registro: #${closing.id}</p>
          </div>
        </div>

        <div class="grid">
          <div class="kpi-card">
            <div class="kpi-title">Facturación Total Bruta</div>
            <div class="kpi-val">$${closing.totalVentas.toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Comandas Totales</div>
            <div class="kpi-val">${closing.totalComandas}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Ticket Promedio</div>
            <div class="kpi-val">$${closing.ticketPromedio}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Propinas Acumuladas</div>
            <div class="kpi-val">$${closing.propinasTotal.toLocaleString()}</div>
          </div>
        </div>

        <div class="two-col">
          <div>
            <div class="section-title">Desglose de Recaudación por Medio de Pago</div>
            <table>
              <thead><tr><th>Medio de Pago</th><th style="text-align: right;">Monto Recaudado</th></tr></thead>
              <tbody>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Efectivo en Caja</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${closing.efectivoTotal.toLocaleString()}</td></tr>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Tarjetas de Débito (POS)</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${closing.debitoTotal.toLocaleString()}</td></tr>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Tarjetas de Crédito</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${closing.creditoTotal.toLocaleString()}</td></tr>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Transferencias / QR</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${closing.transferenciaTotal.toLocaleString()}</td></tr>
                <tr style="background: #f8fafc;"><td style="padding: 8px 10px; font-weight: 800;">TOTAL GENERAL FACTURADO</td><td style="padding: 8px 10px; text-align: right; font-weight: 800; font-size: 14px;">$${closing.totalVentas.toLocaleString()}</td></tr>
              </tbody>
            </table>

            <div class="section-title">Canales de Venta & Operación</div>
            <table>
              <thead><tr><th>Canal</th><th style="text-align: right;">Pedidos</th></tr></thead>
              <tbody>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Delivery a Domicilio</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${closing.pedidosDelivery}</td></tr>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Mostrador / Take Away</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${closing.pedidosLocal}</td></tr>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Mesas en Salón</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${closing.pedidosMesa}</td></tr>
                <tr><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">Turnos Operativos Totales</td><td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${closing.turnosRealizados} turnos</td></tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="section-title">Top 5 Productos Más Vendidos del Mes</div>
            <table>
              <thead><tr><th>Producto</th><th style="text-align: center;">Cantidad</th><th style="text-align: right;">Total</th></tr></thead>
              <tbody>
                ${topItemsHTML || '<tr><td colspan="3" style="text-align: center; padding: 10px;">Sin datos registrados</td></tr>'}
              </tbody>
            </table>

            <div class="section-title">Consumo Físico e Insumos Cocina</div>
            <table>
              <thead><tr><th>Categoría de Insumo</th><th style="text-align: right;">Consumo Estimado</th></tr></thead>
              <tbody>
                ${consumptionHTML || '<tr><td colspan="2" style="text-align: center; padding: 10px;">Sin datos registrados</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        ${closing.observaciones ? `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 15px;">
            <strong style="font-size: 11px; text-transform: uppercase; color: #475569;">Observaciones del Cierre Gerencial:</strong>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #1e293b;">${closing.observaciones}</p>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sig-box">
            Firma Encargado de Caja<br/>
            <strong>${closing.cerradoPor}</strong>
          </div>
          <div class="sig-box">
            Firma Gerencia / Propietario<br/>
            <strong>Auditoría General</strong>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

