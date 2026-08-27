import { initializeApp, getApps } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import firebaseConfigFile from '../../firebase-applet-config.json';
import { MenuItem, Client, HistoricalTurn, Order, MonthlyClosing, DemoAccount } from '../types';
import { defaultMenuList, defaultClients, defaultHistorical, defaultMonthlyClosings } from '../data/defaults';

// Dynamic Firebase configuration: can be supplied via Vercel Environment Variables or local json config
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigFile.firestoreDatabaseId
};

const firebaseConfig = (envConfig.apiKey && envConfig.projectId) 
  ? { ...firebaseConfigFile, ...envConfig }
  : firebaseConfigFile;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

export const auth = getAuth(app);

// Authenticate session automatically anonymously if needed
signInAnonymously(auth).catch((err) => {
  // Anonymous auth might not be enabled in Firebase console
});

// Helper for User / Email login
export async function loginWithUserOrEmail(identifier: string, password: string) {
  const cleanId = identifier.trim();
  const emailToTry = cleanId.includes('@')
    ? cleanId
    : `${cleanId.toLowerCase().replace(/\s+/g, '')}@nextcrm.demo`;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailToTry, password);
    return { success: true, user: userCredential.user, emailUsed: emailToTry };
  } catch (error: any) {
    return { success: false, error: error.code || error.message, triedEmail: emailToTry };
  }
}

// Collections
export const MENU_COLLECTION = 'menu_items';
export const CLIENTS_COLLECTION = 'clients';
export const HISTORICAL_COLLECTION = 'historical_turns';
export const ORDERS_COLLECTION = 'orders';
export const SETTINGS_COLLECTION = 'app_settings';
export const DEMO_REQUESTS_COLLECTION = 'demo_requests';
export const MONTHLY_CLOSINGS_COLLECTION = 'monthly_closings';


export interface DemoRequest {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string;
  negocio?: string;
  timestamp?: number;
  status?: 'pendiente' | 'contactado' | 'aprobado';
  modoAcceso?: 'nombre' | 'correo' | string;
}

export async function saveDemoRequest(request: DemoRequest) {
  try {
    const id = request.id || `req_${Date.now()}`;
    const fullReq = {
      ...request,
      id,
      timestamp: request.timestamp || Date.now(),
      status: request.status || 'pendiente'
    };
    await setDoc(doc(db, DEMO_REQUESTS_COLLECTION, id), fullReq);
    return { success: true, id };
  } catch (err: any) {
    console.warn('Error saving demo request:', err);
    return { success: false, error: err.message };
  }
}

export const ADMIN_IDENTIFIERS = [
  'jpz1207uy@gmail.com',
  'jpz207ui@gmail.com',
  'jpz207ui',
  'jpz1207uy',
  'admin@nextcrm.uy',
  'admin'
];

export const DEMO_ACCOUNTS_COLLECTION = 'demo_accounts';

export function isAdminUser(identifier?: string | null): boolean {
  if (!identifier) return false;
  const clean = identifier.toLowerCase().trim();
  return ADMIN_IDENTIFIERS.some(adminId => adminId.toLowerCase() === clean || clean.includes('jpz207ui') || clean.includes('jpz1207uy'));
}

export async function saveDemoAccount(account: DemoAccount) {
  try {
    const accId = account.id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullAccount: DemoAccount = {
      ...account,
      id: accId,
      creadoTimestamp: account.creadoTimestamp || Date.now(),
      estado: account.estado || 'activo',
      duracionHoras: account.duracionHoras ?? 24,
      creadoPor: account.creadoPor || 'jpz1207uy@gmail.com',
      totalIngresos: account.totalIngresos || 0
    };
    await setDoc(doc(db, DEMO_ACCOUNTS_COLLECTION, accId), fullAccount);
    return { success: true, account: fullAccount };
  } catch (err: any) {
    console.warn('Error saving demo account:', err);
    return { success: false, error: err.message };
  }
}

export async function getDemoAccounts(): Promise<DemoAccount[]> {
  try {
    const snap = await getDocs(collection(db, DEMO_ACCOUNTS_COLLECTION));
    const list: DemoAccount[] = [];
    snap.forEach((d) => list.push(d.data() as DemoAccount));
    return list.sort((a, b) => (b.creadoTimestamp || 0) - (a.creadoTimestamp || 0));
  } catch (err) {
    console.warn('Error getting demo accounts:', err);
    return [];
  }
}

export function subscribeDemoAccounts(callback: (accounts: DemoAccount[]) => void) {
  return onSnapshot(collection(db, DEMO_ACCOUNTS_COLLECTION), (snap) => {
    const list: DemoAccount[] = [];
    snap.forEach((d) => list.push(d.data() as DemoAccount));
    callback(list.sort((a, b) => (b.creadoTimestamp || 0) - (a.creadoTimestamp || 0)));
  }, (err) => {
    console.warn('Snapshot error demo accounts:', err);
  });
}

export async function updateDemoAccount(id: string, updates: Partial<DemoAccount>) {
  try {
    await updateDoc(doc(db, DEMO_ACCOUNTS_COLLECTION, id), updates as any);
    return { success: true };
  } catch (err: any) {
    console.warn('Error updating demo account:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteDemoAccount(id: string) {
  try {
    await deleteDoc(doc(db, DEMO_ACCOUNTS_COLLECTION, id));
    return { success: true };
  } catch (err: any) {
    console.warn('Error deleting demo account:', err);
    return { success: false, error: err.message };
  }
}

export async function verifyDemoAccess(identifier: string, passwordInput?: string): Promise<{ 
  allowed: boolean; 
  message: string; 
  expiresAt?: number;
  remainingHours?: number;
  remainingMinutes?: number;
  clientName?: string;
  isAdmin?: boolean;
  isExpired?: boolean;
  isLocked?: boolean;
  account?: DemoAccount;
}> {
  const cleanId = identifier.trim();
  if (!cleanId) {
    return { allowed: false, message: 'Por favor ingresa tu correo de usuario o clave de acceso.' };
  }

  // 1. ADMIN DIRECT BYPASS (JPZ207UI / jpz1207uy@gmail.com)
  if (isAdminUser(cleanId)) {
    const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
    saveLocalDemoSession(cleanId, expiresAt, 'Administrador General (JPZ)', true);
    return { 
      allowed: true, 
      isAdmin: true,
      message: '¡Bienvenido Administrador! Acceso total y permanente habilitado sin restricciones.', 
      expiresAt,
      remainingHours: 999999,
      clientName: 'Administrador (JPZ)'
    };
  }

  // 2. Check Firestore demo_accounts collection (Authorized Client Accounts)
  try {
    const snapshot = await getDocs(collection(db, DEMO_ACCOUNTS_COLLECTION));
    const now = Date.now();
    let matchingDoc: DemoAccount | null = null;

    snapshot.forEach(d => {
      const acc = d.data() as DemoAccount;
      const accUser = (acc.emailOrUser || '').toLowerCase().trim();
      const accName = (acc.clienteNombre || '').toLowerCase().trim();
      const search = cleanId.toLowerCase();

      if (accUser === search || accName === search || (acc.negocioNombre && acc.negocioNombre.toLowerCase().trim() === search)) {
        matchingDoc = acc;
      }
    });

    if (matchingDoc) {
      const acc: DemoAccount = matchingDoc;

      // Validate password if configured for this client
      if (acc.password && passwordInput !== undefined && passwordInput !== '') {
        if (acc.password.trim() !== passwordInput.trim()) {
          return {
            allowed: false,
            message: 'La contraseña ingresada no es correcta para este usuario.'
          };
        }
      }

      // Check if blocked by admin
      if (acc.estado === 'bloqueado') {
        return {
          allowed: false,
          isLocked: true,
          message: 'Tu cuenta demo ha sido pausada o bloqueada por el administrador. Contáctanos por WhatsApp.'
        };
      }

      // If first login, activate the countdown window now!
      let activadoTimestamp = acc.activadoTimestamp || now;
      let expiraTimestamp = acc.expiraTimestamp;

      if (!acc.activadoTimestamp) {
        activadoTimestamp = now;
        if (acc.duracionHoras > 0) {
          expiraTimestamp = now + (acc.duracionHoras * 3600 * 1000);
        } else {
          expiraTimestamp = now + (365 * 24 * 3600 * 1000); // unlimited
        }
        await updateDemoAccount(acc.id, {
          activadoTimestamp,
          expiraTimestamp,
          ultimoIngresoTimestamp: now,
          totalIngresos: (acc.totalIngresos || 0) + 1
        });
      } else {
        await updateDemoAccount(acc.id, {
          ultimoIngresoTimestamp: now,
          totalIngresos: (acc.totalIngresos || 0) + 1
        });
      }

      // Check expiration
      if (acc.duracionHoras > 0 && expiraTimestamp && now > expiraTimestamp) {
        await updateDemoAccount(acc.id, { estado: 'expirado' });
        return {
          allowed: false,
          isExpired: true,
          message: `Tu período de prueba de ${acc.duracionHoras} Horas ha finalizado. Contacta al administrador para adquirir tu licencia oficial.`
        };
      }

      const remainingMs = (expiraTimestamp || now + 86400000) - now;
      const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
      const remainingMinutes = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));

      saveLocalDemoSession(acc.emailOrUser, expiraTimestamp || (now + 86400000), acc.clienteNombre || acc.emailOrUser, false, (acc.plan as any) || 'plan_full');

      return {
        allowed: true,
        message: `¡Bienvenido ${acc.clienteNombre || ''}! Acceso activo (${remainingHours}h ${remainingMinutes}m restantes).`,
        expiresAt: expiraTimestamp,
        remainingHours,
        remainingMinutes,
        clientName: acc.clienteNombre || acc.emailOrUser,
        account: acc
      };
    }
  } catch (err) {
    console.warn('Error verifying demo in Firestore:', err);
  }

  // 3. Check demo requests collection
  try {
    const snapshotReqs = await getDocs(collection(db, DEMO_REQUESTS_COLLECTION));
    const matchingReq = snapshotReqs.docs.find(d => {
      const data = d.data();
      return (
        (data.email && data.email.toLowerCase() === cleanId.toLowerCase()) ||
        (data.nombre && data.nombre.toLowerCase() === cleanId.toLowerCase())
      );
    });

    if (matchingReq) {
      const data = matchingReq.data();
      const reqTime = data.timestamp || Date.now();
      const expiresAt = reqTime + 24 * 60 * 60 * 1000;
      const isExpired = Date.now() > expiresAt;

      if (isExpired) {
        return {
          allowed: false,
          isExpired: true,
          message: 'Tu período de prueba de 24 horas ha expirado. Contáctanos por WhatsApp para habilitar tu licencia.'
        };
      }

      const remainingMs = expiresAt - Date.now();
      const remainingHours = Math.max(1, Math.round(remainingMs / (1000 * 60 * 60)));
      saveLocalDemoSession(cleanId, expiresAt, data.nombre || data.email, false, 'plan_full');
      return {
        allowed: true,
        message: `¡Bienvenido ${data.nombre || ''}! Acceso de prueba verificado.`,
        expiresAt,
        remainingHours,
        clientName: data.nombre || data.email
      };
    }
  } catch (err) {
    console.warn('Error checking demo_requests:', err);
  }

  return {
    allowed: false,
    message: 'Usuario o credencial no autorizada. Para ingresar, solicita tu acceso demo o contacta al administrador.'
  };
}

export function saveLocalDemoSession(
  identifier: string, 
  expiresAt: number, 
  clientName?: string, 
  isAdmin: boolean = false,
  plan: 'plan_basico' | 'plan_pro' | 'plan_vip' | 'plan_full' = 'plan_full'
) {
  try {
    localStorage.setItem('nextcrm_demo_session', JSON.stringify({
      identifier,
      expiresAt,
      clientName: clientName || identifier,
      isAdmin,
      plan,
      authorizedAt: Date.now()
    }));
  } catch (_) {}
}

export function getLocalDemoSession(): { 
  isValid: boolean; 
  remainingHours: number; 
  remainingMinutes: number;
  identifier?: string; 
  clientName?: string;
  isAdmin?: boolean;
  isExpired?: boolean;
  plan?: 'plan_basico' | 'plan_pro' | 'plan_vip' | 'plan_full';
} {
  try {
    const raw = localStorage.getItem('nextcrm_demo_session');
    if (!raw) return { isValid: false, remainingHours: 0, remainingMinutes: 0, isExpired: false, plan: 'plan_basico' };
    const session = JSON.parse(raw);
    const now = Date.now();

    if (session.isAdmin || isAdminUser(session.identifier)) {
      return {
        isValid: true,
        remainingHours: 999999,
        remainingMinutes: 0,
        identifier: session.identifier,
        clientName: session.clientName || 'Administrador (JPZ)',
        isAdmin: true,
        isExpired: false,
        plan: 'plan_full'
      };
    }

    if (session.expiresAt && session.expiresAt > now) {
      const remainingMs = session.expiresAt - now;
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return {
        isValid: true,
        remainingHours,
        remainingMinutes,
        identifier: session.identifier,
        clientName: session.clientName,
        isAdmin: false,
        isExpired: false,
        plan: session.plan || 'plan_full'
      };
    }

    return { 
      isValid: false, 
      remainingHours: 0, 
      remainingMinutes: 0, 
      identifier: session.identifier,
      clientName: session.clientName,
      isExpired: true,
      plan: session.plan || 'plan_basico'
    };
  } catch (_) {
    return { isValid: false, remainingHours: 0, remainingMinutes: 0, isExpired: false, plan: 'plan_basico' };
  }
}

export function clearLocalDemoSession() {
  try {
    localStorage.removeItem('nextcrm_demo_session');
  } catch (_) {}
}

// Subscribe to Menu Items with auto-seed
export function subscribeMenuItems(callback: (items: MenuItem[]) => void) {
  return onSnapshot(collection(db, MENU_COLLECTION), async (snapshot) => {
    if (snapshot.empty) {
      // Seed initial menu and notify listener immediately
      callback(defaultMenuList);
      for (const item of defaultMenuList) {
        await setDoc(doc(db, MENU_COLLECTION, String(item.id)), item);
      }
    } else {
      const items: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MenuItem);
      });
      callback(items.length > 0 ? items : defaultMenuList);
    }
  }, (err) => {
    console.warn('Error reading menu items, using default list:', err);
    callback(defaultMenuList);
  });
}

// Subscribe to Clients with auto-seed
export function subscribeClients(callback: (clients: Client[]) => void) {
  return onSnapshot(collection(db, CLIENTS_COLLECTION), async (snapshot) => {
    if (snapshot.empty) {
      callback(defaultClients);
      for (const client of defaultClients) {
        await setDoc(doc(db, CLIENTS_COLLECTION, String(client.id)), client);
      }
    } else {
      const clients: Client[] = [];
      snapshot.forEach((docSnap) => {
        clients.push(docSnap.data() as Client);
      });
      callback(clients.length > 0 ? clients : defaultClients);
    }
  }, (err) => {
    console.warn('Error reading clients, using default list:', err);
    callback(defaultClients);
  });
}

// Subscribe to Historical Turns with auto-seed
export function subscribeHistoricalTurns(callback: (turns: HistoricalTurn[]) => void) {
  return onSnapshot(collection(db, HISTORICAL_COLLECTION), async (snapshot) => {
    if (snapshot.empty) {
      callback(defaultHistorical);
      for (const turn of defaultHistorical) {
        await setDoc(doc(db, HISTORICAL_COLLECTION, String(turn.id)), turn);
      }
    } else {
      const turns: HistoricalTurn[] = [];
      snapshot.forEach((docSnap) => {
        turns.push(docSnap.data() as HistoricalTurn);
      });
      callback(turns.length > 0 ? turns : defaultHistorical);
    }
  }, (err) => {
    console.warn('Error reading historical turns, using default list:', err);
    callback(defaultHistorical);
  });
}

// Subscribe to Orders
export function subscribeOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(collection(db, ORDERS_COLLECTION), (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    // Sort orders by timestamp ascending
    orders.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    callback(orders);
  }, (err) => {
    console.warn('Error reading orders:', err);
    callback([]);
  });
}

// Save or Update an Order
export async function saveOrder(order: Order) {
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
  } catch (err) {
    console.warn('Error saving order:', err);
  }
}

// Delete an Order
export async function deleteOrder(orderId: string) {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (err) {
    console.warn('Error deleting order:', err);
  }
}

// Subscribe to App Shift State
export interface AppStateDoc {
  isCajaAbierta: boolean;
  isLocked: boolean;
  showOpeningForm: boolean;
  cajeroName: string;
  openingCash: string;
  thresholds: { general: number; bebidas: number; postres: number };
  orderCounter: number;
}

export function subscribeAppState(callback: (state: Partial<AppStateDoc>) => void) {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, 'caja'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AppStateDoc);
    } else {
      const defaultState: AppStateDoc = {
        isCajaAbierta: false,
        isLocked: true,
        showOpeningForm: false,
        cajeroName: '',
        openingCash: '',
        thresholds: { general: 30, bebidas: 50, postres: 20 },
        orderCounter: 1,
      };
      setDoc(doc(db, SETTINGS_COLLECTION, 'caja'), defaultState).catch((err) => console.warn('Error seeding app state:', err));
      callback(defaultState);
    }
  }, (err) => {
    console.warn('Error reading app state:', err);
  });
}

export async function saveAppState(state: Partial<AppStateDoc>) {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'caja'), state, { merge: true });
  } catch (err) {
    console.warn('Error saving app state:', err);
  }
}

// Subscribe to Stock
export function subscribeStock(callback: (stock: Record<string, number>) => void) {
  return onSnapshot(doc(db, SETTINGS_COLLECTION, 'stock'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Record<string, number>);
    } else {
      callback({});
    }
  }, (err) => {
    console.warn('Error reading stock state:', err);
    callback({});
  });
}

export async function saveStock(stock: Record<string, number>) {
  try {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'stock'), stock, { merge: true });
  } catch (err) {
    console.warn('Error saving stock:', err);
  }
}

// Save menu items mutation helpers
export async function saveMenuItem(item: MenuItem) {
  try {
    await setDoc(doc(db, MENU_COLLECTION, String(item.id)), item);
  } catch (err) {
    console.warn('Error saving menu item:', err);
  }
}

export async function removeMenuItem(itemId: string | number) {
  try {
    await deleteDoc(doc(db, MENU_COLLECTION, String(itemId)));
  } catch (err) {
    console.warn('Error removing menu item:', err);
  }
}

// Client mutation helpers
export async function saveClient(client: Client) {
  try {
    await setDoc(doc(db, CLIENTS_COLLECTION, String(client.id)), client);
  } catch (err) {
    console.warn('Error saving client:', err);
  }
}

export async function removeClient(clientId: string | number) {
  try {
    await deleteDoc(doc(db, CLIENTS_COLLECTION, String(clientId)));
  } catch (err) {
    console.warn('Error removing client:', err);
  }
}

// Historical turns mutation helpers
export async function saveHistoricalTurn(turn: HistoricalTurn) {
  try {
    await setDoc(doc(db, HISTORICAL_COLLECTION, String(turn.id)), turn);
  } catch (err) {
    console.warn('Error saving historical turn:', err);
  }
}

export async function clearHistoricalTurns() {
  try {
    const snapshot = await getDocs(collection(db, HISTORICAL_COLLECTION));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, HISTORICAL_COLLECTION, docSnap.id));
    }
  } catch (err) {
    console.warn('Error clearing historical turns:', err);
  }
}

export async function removeHistoricalTurn(id: string | number) {
  try {
    await deleteDoc(doc(db, HISTORICAL_COLLECTION, String(id)));
  } catch (err) {
    console.warn('Error removing historical turn:', err);
  }
}

// Monthly Closings Subscription & Mutation Helpers
export function subscribeMonthlyClosings(callback: (closings: MonthlyClosing[]) => void) {
  return onSnapshot(collection(db, MONTHLY_CLOSINGS_COLLECTION), async (snapshot) => {
    if (snapshot.empty) {
      callback(defaultMonthlyClosings);
      for (const closing of defaultMonthlyClosings) {
        await setDoc(doc(db, MONTHLY_CLOSINGS_COLLECTION, closing.id), closing);
      }
    } else {
      const closings: MonthlyClosing[] = [];
      snapshot.forEach((docSnap) => {
        closings.push(docSnap.data() as MonthlyClosing);
      });
      // Sort by timestamp descending (newest month first)
      closings.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      callback(closings.length > 0 ? closings : defaultMonthlyClosings);
    }
  }, (err) => {
    console.warn('Error reading monthly closings, using defaults:', err);
    callback(defaultMonthlyClosings);
  });
}

export async function saveMonthlyClosing(closing: MonthlyClosing) {
  try {
    await setDoc(doc(db, MONTHLY_CLOSINGS_COLLECTION, closing.id), closing);
  } catch (err) {
    console.warn('Error saving monthly closing:', err);
  }
}

export async function removeMonthlyClosing(id: string) {
  try {
    await deleteDoc(doc(db, MONTHLY_CLOSINGS_COLLECTION, id));
  } catch (err) {
    console.warn('Error removing monthly closing:', err);
  }
}

export async function clearMonthlyClosings() {
  try {
    const snapshot = await getDocs(collection(db, MONTHLY_CLOSINGS_COLLECTION));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, MONTHLY_CLOSINGS_COLLECTION, docSnap.id));
    }
  } catch (err) {
    console.warn('Error clearing monthly closings:', err);
  }
}


