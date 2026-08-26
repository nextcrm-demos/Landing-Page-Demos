import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini on server-side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
  });

  // AI Order Parser Endpoint (Voice Dictation / WhatsApp Messages)
  app.post('/api/ai/parse-order', async (req, res) => {
    try {
      const { text, menuItems = [], gustos = [] } = req.body;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: 'El texto del pedido es requerido.' });
      }

      if (!ai) {
        if (process.env.GEMINI_API_KEY) {
          ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });
        }
      }

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY no configurada en el servidor. Se usará el parser local.',
          fallback: true,
        });
      }

      const menuDescription = menuItems
        .map((m: any) => `- ID "${m.id}": "${m.nombre}" (Categoría: ${m.categoria}, Precio: $${m.precio})`)
        .join('\n');

      const gustosDescription = gustos
        .map((g: any) => `- Gusto "${g.nombre}" (ID: "${g.id}", Precio: $${g.precio})`)
        .join('\n');

      const prompt = `Eres un asistente experto de toma de pedidos para una pizzería uruguaya (NextCrm Pizzería).
Tu tarea es analizar el siguiente texto de dictado por voz o mensaje de WhatsApp de un cliente y extraer la orden estructurada con la mayor precisión posible.

MENÚ DISPONIBLE DE LA PIZZERÍA:
${menuDescription}

GUSTOS Y ADICIONALES DE PIZZA DISPONIBLES:
${gustosDescription}

TEXTO RECIBIDO DEL CLIENTE (Voz o WhatsApp):
"""
${text}
"""

REGLAS DE INTERPRETACIÓN:
1. Mapea cada producto pedido al ID o nombre más exacto del MENÚ DISPONIBLE.
   - Si piden "muzza", "pizza muzzarella", "muzzarella porción", etc. asócialo al ítem correspondiente ("(Porción) Pizza Muzzarella", "1/2 Metro Pizza Muzzarella", "1 Metro Pizza Muzzarella" o "Pizzeta Muzzarella" según lo que diga o por defecto a porción/pizzeta si no especifica tamaño).
   - "faina", "fainá de orilla", "fainá orilla", "fainá centro" -> asócialo a "Fainá Orilla" o "Fainá Centro".
   - "coca", "refresco", "patricia", "cerveza" -> asócialo al refresco o bebida correspondiente.
   - Si piden gustos extra como "con panceta", "con morrones", "con huevo", agrégalos en el array "gustos" del ítem si es pizza/pizzeta.
2. Extrae los datos del cliente:
   - "nombre": Nombre de la persona si está presente.
   - "direccion": Dirección exacta o indicaciones si es delivery/envío.
   - "telefono": Número de celular o teléfono si lo menciona.
   - "mesa": Número de mesa si menciona estar en una mesa o comedor.
3. Extrae la información de pago y entrega:
   - "tipo": 'envio' (si piden delivery/envío o mencionan dirección), 'mesa' (si es en salón/mesa), o 'local' (si es para retirar en mostrador o local).
   - "metodo": 'efectivo', 'debito', 'credito', 'transferencia', o 'a confirmar'.
   - "abono": Si pagan en efectivo y dicen con cuánto pagan (ej: "pago con 1000", "con 500"), coloca el número como string (ej: "1000").
   - "notas": Notas especiales para cocina (ej: "sin sal", "bien cocida", "cortada en 8").
4. Escribe un "resumen" breve y claro en español de lo que detectaste.`;

      const schemaConfig = {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productos: {
              type: Type.ARRAY,
              description: 'Lista de productos pedidos identificados en el menú.',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'ID del producto en el menú si coincide, o vacío' },
                  nombre: { type: Type.STRING, description: 'Nombre exacto del producto según el menú' },
                  cantidad: { type: Type.INTEGER, description: 'Cantidad pedida' },
                  notas: { type: Type.STRING, description: 'Notas específicas del producto o gustos' },
                  gustosNombres: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Lista de nombres de gustos adicionales (ej. Panceta, Morrones)',
                  },
                },
                required: ['nombre', 'cantidad'],
              },
            },
            cliente: {
              type: Type.OBJECT,
              properties: {
                nombre: { type: Type.STRING, description: 'Nombre del cliente' },
                direccion: { type: Type.STRING, description: 'Dirección de envío' },
                telefono: { type: Type.STRING, description: 'Teléfono o WhatsApp' },
                mesa: { type: Type.STRING, description: 'Número de mesa si aplica' },
              },
            },
            pago: {
              type: Type.OBJECT,
              properties: {
                tipo: { type: Type.STRING, description: 'envio, local o mesa' },
                metodo: { type: Type.STRING, description: 'efectivo, debito, credito, transferencia o a confirmar' },
                abono: { type: Type.STRING, description: 'Monto con el que abona en efectivo si se especificó' },
                propina: { type: Type.STRING, description: 'Monto de propina si se especificó' },
                notas: { type: Type.STRING, description: 'Notas generales del pedido o para la cocina' },
              },
            },
            resumen: {
              type: Type.STRING,
              description: 'Resumen amigable de los ítems y datos detectados en el pedido.',
            },
          },
          required: ['productos', 'cliente', 'pago', 'resumen'],
        },
      };

      const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
      let lastError: any = null;
      let jsonText = '';

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: schemaConfig,
          });
          if (response.text) {
            jsonText = response.text.trim();
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${model} unavailable, trying next...`);
        }
      }

      if (!jsonText) {
        throw lastError || new Error('No se pudo generar respuesta con los modelos disponibles.');
      }

      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('Error en parse-order con Gemini:', error);
      return res.status(500).json({
        error: error.message || 'Error al procesar el pedido con IA',
        fallback: true,
      });
    }
  });

  // ==========================================
  // WHATSAPP INBOX & WEBHOOK INTEGRATION
  // ==========================================
  let inMemoryWhatsAppChats: any[] = [
    {
      id: 'chat_59898128297',
      contactName: 'ABEL MARTINEZ',
      phone: '098128297',
      avatar: '👨‍💼',
      lastMessage: 'Hola, mandame 1 metro de muzzarella con panceta y 2 fainás a Playa Hermosa',
      lastTimestamp: Date.now() - 1000 * 60 * 12,
      unreadCount: 1,
      messages: [
        {
          id: 'msg_1',
          chatId: 'chat_59898128297',
          senderName: 'ABEL MARTINEZ',
          senderPhone: '098128297',
          text: 'Buenas noches! Tienen abierto el horno?',
          timestamp: Date.now() - 1000 * 60 * 25,
          fromMe: false,
          status: 'leido',
        },
        {
          id: 'msg_2',
          chatId: 'chat_59898128297',
          senderName: 'NextCRM Pizzería',
          senderPhone: '098356320',
          text: '¡Hola Abel! Sí, estamos tomando pedidos con demora estimada de 30-35 min 🔥',
          timestamp: Date.now() - 1000 * 60 * 20,
          fromMe: true,
          status: 'respondido',
        },
        {
          id: 'msg_3',
          chatId: 'chat_59898128297',
          senderName: 'ABEL MARTINEZ',
          senderPhone: '098128297',
          text: 'Hola, mandame 1 metro de muzzarella con panceta y 2 fainás a Playa Hermosa',
          timestamp: Date.now() - 1000 * 60 * 12,
          fromMe: false,
          status: 'recibido',
        }
      ]
    },
    {
      id: 'chat_59892494927',
      contactName: 'JOSELIN',
      phone: '092494927',
      avatar: '👩',
      lastMessage: '2 pizzetas napolitanas y 1 coca de litro y medio para retirar por mostrador',
      lastTimestamp: Date.now() - 1000 * 60 * 4,
      unreadCount: 1,
      messages: [
        {
          id: 'msg_j1',
          chatId: 'chat_59892494927',
          senderName: 'JOSELIN',
          senderPhone: '092494927',
          text: '2 pizzetas napolitanas y 1 coca de litro y medio para retirar por mostrador',
          timestamp: Date.now() - 1000 * 60 * 4,
          fromMe: false,
          status: 'recibido',
        }
      ]
    }
  ];

  // 1. Meta / Evolution Webhook Verification GET
  app.get('/api/whatsapp/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && (token === 'NEXTCRM_WHATSAPP_TOKEN' || token === process.env.WHATSAPP_VERIFY_TOKEN)) {
        console.log('WhatsApp Webhook Verified Successfully!');
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }
    return res.json({ status: 'ok', endpoint: 'WhatsApp Webhook Listener Ready' });
  });

  // 2. Incoming Webhook POST (Receives live messages from Meta Cloud API or Evolution API)
  app.post('/api/whatsapp/webhook', (req, res) => {
    try {
      const body = req.body;
      console.log('Incoming WhatsApp Webhook Payload:', JSON.stringify(body).slice(0, 300));

      let incomingText = '';
      let senderPhone = '';
      let senderName = '';

      // Meta Cloud API format
      if (body.entry && body.entry[0]?.changes && body.entry[0]?.changes[0]?.value?.messages) {
        const msg = body.entry[0].changes[0].value.messages[0];
        const contact = body.entry[0].changes[0].value.contacts?.[0];
        senderPhone = msg.from || '';
        senderName = contact?.profile?.name || senderPhone;
        incomingText = msg.text?.body || msg.interactive?.button_reply?.title || '';
      } 
      // Evolution API / Baileys format
      else if (body.data?.message || body.message || body.body) {
        incomingText = body.data?.message?.conversation || body.message?.text || body.body || body.text || '';
        senderPhone = body.data?.key?.remoteJid?.replace('@s.whatsapp.net', '') || body.sender || body.from || '';
        senderName = body.data?.pushName || body.senderName || senderPhone;
      }
      // Direct raw JSON format
      else if (body.text) {
        incomingText = body.text;
        senderPhone = body.phone || '099000111';
        senderName = body.name || 'Cliente WhatsApp';
      }

      if (incomingText) {
        const chatId = `chat_${senderPhone.replace(/\D/g, '') || Date.now()}`;
        const newMsg = {
          id: `msg_${Date.now()}`,
          chatId,
          senderName: senderName || 'Cliente',
          senderPhone,
          text: incomingText,
          timestamp: Date.now(),
          fromMe: false,
          status: 'recibido',
        };

        const existingChatIdx = inMemoryWhatsAppChats.findIndex(c => c.id === chatId || c.phone.replace(/\D/g, '') === senderPhone.replace(/\D/g, ''));
        if (existingChatIdx >= 0) {
          inMemoryWhatsAppChats[existingChatIdx].messages.push(newMsg);
          inMemoryWhatsAppChats[existingChatIdx].lastMessage = incomingText;
          inMemoryWhatsAppChats[existingChatIdx].lastTimestamp = Date.now();
          inMemoryWhatsAppChats[existingChatIdx].unreadCount += 1;
        } else {
          inMemoryWhatsAppChats.unshift({
            id: chatId,
            contactName: senderName || 'Cliente WhatsApp',
            phone: senderPhone,
            avatar: '🍕',
            lastMessage: incomingText,
            lastTimestamp: Date.now(),
            unreadCount: 1,
            messages: [newMsg]
          });
        }
      }

      return res.status(200).json({ status: 'success', received: true });
    } catch (err: any) {
      console.error('Error handling WhatsApp webhook:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // 3. Get all chats
  app.get('/api/whatsapp/chats', (req, res) => {
    return res.json({ success: true, chats: inMemoryWhatsAppChats });
  });

  // 4. Send outbound reply
  app.post('/api/whatsapp/send', (req, res) => {
    const { chatId, text } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ error: 'chatId y text son requeridos.' });
    }

    const chat = inMemoryWhatsAppChats.find(c => c.id === chatId);
    if (chat) {
      const replyMsg = {
        id: `msg_${Date.now()}`,
        chatId,
        senderName: 'NextCRM Pizzería',
        senderPhone: '098356320',
        text,
        timestamp: Date.now(),
        fromMe: true,
        status: 'respondido',
      };
      chat.messages.push(replyMsg);
      chat.lastMessage = text;
      chat.lastTimestamp = Date.now();
      chat.unreadCount = 0;
    }

    return res.json({ success: true, message: 'Mensaje enviado correctamente' });
  });

  // 5. Simulate an incoming customer message
  app.post('/api/whatsapp/simulate', (req, res) => {
    const { contactName, phone, text, address } = req.body;
    const senderPhone = phone || '098128297';
    const chatId = `chat_${senderPhone.replace(/\D/g, '')}`;
    const newMsg = {
      id: `msg_${Date.now()}`,
      chatId,
      senderName: contactName || 'Cliente Simulado',
      senderPhone,
      text: text || 'Hola, quiero pedir 1 metro de muzzarella con panceta',
      timestamp: Date.now(),
      fromMe: false,
      status: 'recibido',
    };

    const existingChatIdx = inMemoryWhatsAppChats.findIndex(c => c.id === chatId || c.phone.replace(/\D/g, '') === senderPhone.replace(/\D/g, ''));
    if (existingChatIdx >= 0) {
      inMemoryWhatsAppChats[existingChatIdx].messages.push(newMsg);
      inMemoryWhatsAppChats[existingChatIdx].lastMessage = newMsg.text;
      inMemoryWhatsAppChats[existingChatIdx].lastTimestamp = Date.now();
      inMemoryWhatsAppChats[existingChatIdx].unreadCount += 1;
    } else {
      inMemoryWhatsAppChats.unshift({
        id: chatId,
        contactName: contactName || 'Cliente WhatsApp',
        phone: senderPhone,
        avatar: '💬',
        lastMessage: newMsg.text,
        lastTimestamp: Date.now(),
        unreadCount: 1,
        messages: [newMsg]
      });
    }

    return res.json({ success: true, chats: inMemoryWhatsAppChats });
  });

  // Vite integration (development vs production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pizzeria Server & POS listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
