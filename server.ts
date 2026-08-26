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
