import React, { useState, useEffect } from 'react';
import { 
  MenuItem, Client, HistoricalTurn, CartItem, OrderClient, OrderPayment, Order, ModalConfig, Gusto, MonthlyClosing 
} from './types';
import { defaultMenuList, defaultClients, defaultHistorical, defaultMonthlyClosings } from './data/defaults';
import { printTicket } from './utils/printHelpers';


import { Presentacion } from './components/Presentacion';
import { Header } from './components/Header';
import { AperturaCaja } from './components/AperturaCaja';
import { POSModule } from './components/POSModule';
import { KDSModule } from './components/KDSModule';
import { OrderBoard, FinalizadosView } from './components/OrderBoard';
import { ClientesModule } from './components/ClientesModule';
import { MenuModule } from './components/MenuModule';
import { StockModule } from './components/StockModule';
import { ReportesModule } from './components/ReportesModule';
import { HistorialModule } from './components/HistorialModule';
import { ArqueoModule } from './components/ArqueoModule';
import { SoporteModule } from './components/SoporteModule';
import { Modals } from './components/Modals';
import { FacturacionModule } from './components/FacturacionModule';
import { AIOrderModal } from './components/AIOrderModal';
import { AdminDemoPanelModal } from './components/AdminDemoPanelModal';
import { ExpiredDemoLockScreen } from './components/ExpiredDemoLockScreen';
import { WhatsAppInboxModule } from './components/WhatsAppInboxModule';
import { WebClientAppModule } from './components/WebClientAppModule';
import { ModuleLockScreen } from './components/ModuleLockScreen';
import { ParsedOrderResult } from './utils/aiOrderParser';

import {
  subscribeMenuItems,
  subscribeClients,
  subscribeHistoricalTurns,
  subscribeOrders,
  subscribeAppState,
  subscribeStock,
  saveOrder,
  deleteOrder,
  saveAppState,
  saveStock,
  saveMenuItem,
  removeMenuItem,
  saveClient,
  removeClient,
  saveHistoricalTurn,
  removeHistoricalTurn,
  clearHistoricalTurns,
  subscribeMonthlyClosings,
  saveMonthlyClosing,
  removeMonthlyClosing,
  getLocalDemoSession
} from './lib/firebase';


export default function App() {
  const [showPresentation, setShowPresentation] = useState(() => {
    // If VITE_ENABLE_LANDING is false, disable landing by default (direct CRM mode for clients)
    const envLanding = import.meta.env.VITE_ENABLE_LANDING;
    if (envLanding === 'false') {
      return false;
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('demo') === 'true' || 
        params.get('mode') === 'demo' || 
        params.get('direct') === 'true' || 
        params.get('crm') === 'true'
      ) {
        return false;
      }
      if (params.get('landing') === 'true') {
        return true;
      }
    }
    return true;
  });

  const [isLocked, setIsLocked] = useState(true);
  const [isCajaAbierta, setIsCajaAbierta] = useState(false);
  const [showOpeningForm, setShowOpeningForm] = useState(false);
  const [cajeroName, setCajeroName] = useState('');
  
  const [openingCash, setOpeningCash] = useState('');
  const [openingError, setOpeningError] = useState('');
  const [thresholds, setThresholds] = useState({ general: 30, bebidas: 50, postres: 20 });
  const [initialStockSetup, setInitialStockSetup] = useState<Record<string, string>>({});
  const [stock, setStock] = useState<Record<string, number>>({});
  
  const [activeTab, setActiveTab] = useState('Toma de Pedidos');
  const [activeCategory, setActiveCategory] = useState('pizzas');
  
  // Base de datos sincronizada con Firebase Firestore
  const [menuItems, setMenuItemsState] = useState<MenuItem[]>(defaultMenuList);
  const [clientsDB, setClientsDBState] = useState<Client[]>(defaultClients);
  const [historicalTurns, setHistoricalTurnsState] = useState<HistoricalTurn[]>(defaultHistorical);
  
  // Flujo de Ordenes
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrderClient, setCurrentOrderClient] = useState<OrderClient>({ nombre: '', mesa: '', telefono: '', direccion: '' });
  const [currentOrderPayment, setCurrentOrderPayment] = useState<OrderPayment>({ tipo: 'local', metodo: 'efectivo', notas: '', programado: false, horaProgramada: '', abono: '', propina: '', cadete: 'Samuel' });
  const [posStep, setPosStep] = useState(1);
  const [orderCounter, setOrderCounter] = useState(1);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); 
  
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]); 
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);     
  const [dailyOrders, setDailyOrders] = useState<Order[]>([]);     
  
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [payMesaMetodo, setPayMesaMetodo] = useState('efectivo');
  const [payMesaAbono, setPayMesaAbono] = useState('');
  const [payMesaPropina, setPayMesaPropina] = useState('');

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'guided_voice' | 'voice' | 'whatsapp'>('guided_voice');
  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosing[]>(defaultMonthlyClosings);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isExpiredLocked, setIsExpiredLocked] = useState(false);
  const [userPlan, setUserPlan] = useState<'plan_basico' | 'plan_pro' | 'plan_vip' | 'plan_full'>(() => {
    const saved = localStorage.getItem('nextcrm_user_plan');
    return (saved as any) || 'plan_full';
  });

  const handlePlanUpgrade = (newPlan: 'plan_pro' | 'plan_vip' | 'plan_full') => {
    setUserPlan(newPlan);
    localStorage.setItem('nextcrm_user_plan', newPlan);
  };

  // Anti-Copy & Anti-Inspection Protection for client demos
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const session = getLocalDemoSession();
      if (!session.isAdmin) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const session = getLocalDemoSession();
      if (!session.isAdmin) {
        // Prevent Ctrl+U, Ctrl+Shift+I, F12, Ctrl+S
        if (
          e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Demo expiration check loop
  useEffect(() => {
    const checkDemoValidity = () => {
      const session = getLocalDemoSession();
      if (session.isExpired && !session.isAdmin) {
        setIsExpiredLocked(true);
      }
    };

    checkDemoValidity();
    const interval = setInterval(checkDemoValidity, 60000);
    return () => clearInterval(interval);
  }, []);

  // Firestore Subscriptions (Real-time updates)
  useEffect(() => {
    const unsubMenu = subscribeMenuItems((items) => setMenuItemsState(items));
    const unsubClients = subscribeClients((cls) => setClientsDBState(cls));
    const unsubHistory = subscribeHistoricalTurns((turns) => setHistoricalTurnsState(turns));
    const unsubStock = subscribeStock((stk) => setStock(stk));
    const unsubMonthly = subscribeMonthlyClosings((closings) => setMonthlyClosings(closings));
    
    const unsubOrders = subscribeOrders((allOrders) => {
      setDailyOrders(allOrders);
      setKitchenOrders(allOrders.filter(o => o.estado === 'preparando'));
      setReadyOrders(allOrders.filter(o => o.estado === 'listo'));
    });

    const unsubState = subscribeAppState((state) => {
      if (state.isCajaAbierta !== undefined) setIsCajaAbierta(state.isCajaAbierta);
      if (state.isLocked !== undefined) setIsLocked(state.isLocked);
      if (state.showOpeningForm !== undefined) setShowOpeningForm(state.showOpeningForm);
      if (state.cajeroName !== undefined) setCajeroName(state.cajeroName);
      if (state.openingCash !== undefined) setOpeningCash(state.openingCash);
      if (state.thresholds !== undefined) setThresholds(state.thresholds);
      if (state.orderCounter !== undefined) setOrderCounter(state.orderCounter);
    });

    return () => {
      unsubMenu();
      unsubClients();
      unsubHistory();
      unsubOrders();
      unsubState();
      unsubStock();
      unsubMonthly();
    };
  }, []);


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hasExistingStock = Object.values(stock).some(val => Number(val) > 0);
    if (hasExistingStock) {
       const mapped: Record<string, string> = {};
       Object.entries(stock).forEach(([k, v]) => { mapped[k] = String(v); });
       setInitialStockSetup(mapped);
    }
  }, [stock]);

  // Wrappers to mutate Menu in Firestore
  const setMenuItems = (action: React.SetStateAction<MenuItem[]>) => {
    const nextValue = typeof action === 'function' ? action(menuItems) : action;
    setMenuItemsState(nextValue);

    // Sync additions, edits or resets to Firestore
    const currentIds = new Set(nextValue.map(i => String(i.id)));
    menuItems.forEach(oldItem => {
      if (!currentIds.has(String(oldItem.id))) {
        removeMenuItem(oldItem.id);
      }
    });
    nextValue.forEach(newItem => {
      saveMenuItem(newItem);
    });
  };

  // Wrappers to mutate Clients in Firestore
  const setClientsDB = (action: React.SetStateAction<Client[]>) => {
    const nextValue = typeof action === 'function' ? action(clientsDB) : action;
    setClientsDBState(nextValue);

    const currentIds = new Set(nextValue.map(c => String(c.id)));
    clientsDB.forEach(oldClient => {
      if (!currentIds.has(String(oldClient.id))) {
        removeClient(oldClient.id);
      }
    });
    nextValue.forEach(newClient => {
      saveClient(newClient);
    });
  };

  // Wrappers to mutate Historical Turns in Firestore
  const setHistoricalTurns = (action: React.SetStateAction<HistoricalTurn[]>) => {
    const nextValue = typeof action === 'function' ? action(historicalTurns) : action;
    setHistoricalTurnsState(nextValue);

    if (nextValue.length === 0) {
      clearHistoricalTurns();
    } else {
      const currentIds = new Set(nextValue.map(h => String(h.id)));
      historicalTurns.forEach(oldTurn => {
        if (!currentIds.has(String(oldTurn.id))) {
          removeHistoricalTurn(oldTurn.id);
        }
      });
      nextValue.forEach(newTurn => {
        saveHistoricalTurn(newTurn);
      });
    }
  };

  const handleOpenRegister = () => {
    if (!openingCash || isNaN(Number(openingCash)) || Number(openingCash) < 0 || openingCash.trim() === '') {
       setOpeningError('⚠️ REQUISITO OBLIGATORIO: Debes ingresar el Efectivo Inicial en Caja para operar.');
       return;
    }
    setOpeningError('');
    const newStock: Record<string, number> = {};
    menuItems.forEach(item => {
      const idStr = String(item.id);
      const userTyped = initialStockSetup[item.id];
      if (userTyped !== undefined && userTyped !== '' && !isNaN(parseInt(userTyped, 10))) {
        newStock[idStr] = Math.max(0, parseInt(userTyped, 10));
      } else {
        // Stock setup is optional: preserve existing stock or assign healthy default (25)
        newStock[idStr] = stock[idStr] !== undefined ? stock[idStr] : 25;
      }
    });
    
    setStock(newStock);
    saveStock(newStock);

    setIsCajaAbierta(true);
    setIsLocked(false);
    saveAppState({
      isCajaAbierta: true,
      isLocked: false,
      openingCash,
      cajeroName,
      thresholds
    });
  };

  // Monthly Closing handlers
  const handleSaveMonthlyClosing = async (closing: MonthlyClosing) => {
    await saveMonthlyClosing(closing);
    setMonthlyClosings(prev => {
      const filtered = prev.filter(c => c.id !== closing.id);
      const updated = [closing, ...filtered];
      updated.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      return updated;
    });
  };

  const handleDeleteMonthlyClosing = async (id: string) => {
    await removeMonthlyClosing(id);
    setMonthlyClosings(prev => prev.filter(c => c.id !== id));
  };


  const triggerModal = (config: ModalConfig) => setModalConfig(config);
  const closeModal = () => setModalConfig(null);

  const promptCerrarTurno = () => {
     const tVentas = dailyOrders.reduce((sum, o) => sum + o.total, 0);
     const tEfectivo = dailyOrders.filter(o => o.pago.metodo === 'efectivo').reduce((sum, o) => sum + o.total, 0);
     const cReal = Number(openingCash) + tEfectivo;

     triggerModal({
         type: 'confirm', 
         title: 'Cerrar y Archivar Turno', 
         message: `¿Estás seguro que deseas cerrar la caja y archivar el turno de ${cajeroName || 'Usuario'}?\n\nVentas Totales: $${tVentas} | Efectivo Físico Esperado: $${cReal}`,
         onConfirm: () => {
             const newTurn: HistoricalTurn = {
               id: String(Date.now()),
               fecha: new Date().toLocaleString(),
               v: tVentas,
               c: cReal,
               cajero: cajeroName || 'Usuario'
             };
             setHistoricalTurns(prev => [newTurn, ...prev]);
             setIsCajaAbierta(false);
             setIsLocked(true);
             setShowOpeningForm(false);
             setDailyOrders([]);
             setKitchenOrders([]);
             setReadyOrders([]);
             saveAppState({
               isCajaAbierta: false,
               isLocked: true,
               showOpeningForm: false
             });
             closeModal();
         }
     });
  };

  const handleNewOrder = () => {
    setCart([]);
    setCurrentOrderClient({ nombre: '', mesa: '', telefono: '', direccion: '' });
    setCurrentOrderPayment({ tipo: 'local', metodo: 'efectivo', notas: '', programado: false, horaProgramada: '', abono: '', propina: '', cadete: 'Samuel' });
    setPosStep(1);
    setLastConfirmedOrder(null);
  };

  const addToCart = (product: MenuItem, cant = 1, selectedGustos: Gusto[] = []) => {
    const totalGustos = selectedGustos.reduce((sum, g) => sum + g.precio, 0);
    const unitPrice = product.precio + totalGustos;
    const notasGustos = selectedGustos.map(g => g.nombre).join(', ');

    setCart(prev => [...prev, { 
      ...product, 
      cantidad: cant, 
      precioUnitario: unitPrice, 
      precio: unitPrice,
      notas: notasGustos ? `+ ${notasGustos}` : ''
    }]);
    setSelectedProduct(null);
  };

  const validateClientData = () => {
    const errors: Record<string, string> = {};
    const { tipo } = currentOrderPayment;
    const { nombre, mesa, telefono } = currentOrderClient;
    
    if (tipo === 'local') {
      if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio para retiros en local.';
    } else if (tipo === 'mesa') {
      if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
      if (!mesa.trim()) errors.mesa = 'El número de mesa es obligatorio.';
    } else if (tipo === 'envio') {
      if (!nombre.trim()) errors.nombre = 'El nombre es obligatorio para envíos.';
      if (!telefono.trim()) errors.telefono = 'El teléfono es obligatorio para envíos.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmPedidoFinal = () => {
    const totalPedido = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const currentTimeString = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const newOrder: Order = {
       id: String(orderCounter).padStart(5, '0'),
       cart: [...cart],
       cliente: {
          ...currentOrderClient,
          direccion: currentOrderPayment.tipo === 'envio' && !currentOrderClient.direccion.trim() ? 'A confirmar' : currentOrderClient.direccion
       },
       pago: {...currentOrderPayment},
       total: totalPedido,
       estado: 'preparando',
       fecha: currentTimeString,
       horaPedido: currentTimeString,
       timestamp: Date.now() 
    };
    
    const nextCounter = orderCounter + 1;
    setOrderCounter(nextCounter);

    const updatedStock = {...stock};
    newOrder.cart.forEach(item => {
       const key = String(item.id);
       if (updatedStock[key] !== undefined) {
         updatedStock[key] -= item.cantidad;
       }
    });
    setStock(updatedStock);

    // Save to Firestore
    saveOrder(newOrder);
    saveStock(updatedStock);
    saveAppState({ orderCounter: nextCounter });

    // Auto-save new client into Agenda de Clientes if not already present
    if (currentOrderClient.nombre.trim()) {
      const existingClient = clientsDB.find(
        c => c.nombre.toLowerCase().trim() === currentOrderClient.nombre.toLowerCase().trim()
      );
      if (!existingClient) {
        const newClient: Client = {
          id: Date.now(),
          nombre: currentOrderClient.nombre.toUpperCase().trim(),
          telefono: currentOrderClient.telefono || '',
          direccion: currentOrderClient.direccion || ''
        };
        saveClient(newClient);
      }
    }

    setLastConfirmedOrder(newOrder);
    setPosStep(4);
  };

  const handleApplyAIParsedOrder = (result: ParsedOrderResult, directConfirm = false) => {
    setCart(result.cart);
    setCurrentOrderClient(result.cliente);
    setCurrentOrderPayment(result.pago);

    if (directConfirm && result.cart.length > 0) {
      const totalPedido = result.cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const orderIdStr = String(orderCounter).padStart(5, '0');

      const newOrder: Order = {
        id: orderIdStr,
        cart: [...result.cart],
        cliente: {
          ...result.cliente,
          nombre: result.cliente.nombre || 'Cliente WhatsApp/Voz',
          direccion: result.pago.tipo === 'envio' && !result.cliente.direccion.trim() ? 'A confirmar' : result.cliente.direccion,
        },
        pago: { ...result.pago },
        total: totalPedido,
        estado: 'preparando',
        fecha: currentTimeString,
        horaPedido: currentTimeString,
        timestamp: Date.now(),
      };

      const nextCounter = orderCounter + 1;
      setOrderCounter(nextCounter);

      const updatedStock = { ...stock };
      newOrder.cart.forEach(item => {
        const key = String(item.id);
        if (updatedStock[key] !== undefined) {
          updatedStock[key] -= item.cantidad;
        }
      });
      setStock(updatedStock);

      saveOrder(newOrder);
      saveStock(updatedStock);
      saveAppState({ orderCounter: nextCounter });

      if (result.cliente.nombre && result.cliente.nombre.trim()) {
        const existingClient = clientsDB.find(
          c => c.nombre.toLowerCase().trim() === result.cliente.nombre.toLowerCase().trim()
        );
        if (!existingClient) {
          const newClient: Client = {
            id: Date.now(),
            nombre: result.cliente.nombre.toUpperCase().trim(),
            telefono: result.cliente.telefono || '',
            direccion: result.cliente.direccion || '',
          };
          saveClient(newClient);
        }
      }

      setLastConfirmedOrder(newOrder);
      setPosStep(4);
    } else {
      if (result.cliente.nombre || result.pago.tipo === 'envio' || result.pago.tipo === 'mesa') {
        setPosStep(2);
      } else {
        setPosStep(1);
      }
    }
  };

  const markAsDone = (id: string) => {
    const orderToMove = dailyOrders.find(o => o.id === id);
    if (orderToMove) {
      const updatedOrder: Order = {
        ...orderToMove,
        estado: 'listo',
        horaListo: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      saveOrder(updatedOrder);
    }
  };

  const finalizeDelivery = (orderId: string, nuevaDireccion: string | null = null, nuevoPago: any = null) => {
    const horaEntregado = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const order = dailyOrders.find(o => o.id === orderId);
    if (order) {
      const updatedOrder: Order = {
        ...order,
        estado: 'entregado',
        horaEntregado,
        cliente: { ...order.cliente, direccion: nuevaDireccion || order.cliente.direccion },
        pago: nuevoPago || order.pago
      };
      saveOrder(updatedOrder);
    }
  };

  const markAsDelivered = (id: string) => {
    const orderToFinalize = readyOrders.find(o => o.id === id);
    if (orderToFinalize) {
      const isEnvio = orderToFinalize.pago.tipo === 'envio';
      const isMesa = orderToFinalize.pago.tipo === 'mesa';
      const needsAddress = !orderToFinalize.cliente.direccion || orderToFinalize.cliente.direccion.toLowerCase().includes('confirmar');
      
      if (isEnvio && needsAddress) {
         triggerModal({
            type: 'input_form',
            title: 'Dirección Pendiente',
            message: 'Este envío no tiene dirección asignada. Por favor, ingresa la dirección definitiva antes de despachar.',
            defaultValues: { direccion: orderToFinalize.cliente.direccion.toLowerCase().includes('confirmar') ? '' : orderToFinalize.cliente.direccion },
            fields: [{ name: 'direccion', label: 'Dirección Exacta' }],
            onConfirm: (data: any) => {
               if (data.direccion.trim()) {
                  finalizeDelivery(id, data.direccion);
                  closeModal();
               }
            }
         });
         return;
      }
      
      if (isMesa) {
         setPaymentModalOrder(orderToFinalize);
         setPayMesaMetodo(orderToFinalize.pago.metodo === 'a confirmar' ? 'efectivo' : orderToFinalize.pago.metodo);
         setPayMesaAbono(orderToFinalize.pago.abono || '');
         setPayMesaPropina(orderToFinalize.pago.propina || '');
         return;
      }

      finalizeDelivery(id);
    }
  };

  const handleEditOrder = (orderId: string, _fromLocation: 'kitchen' | 'ready') => {
    const orderToEdit = dailyOrders.find(o => o.id === orderId);

    if (orderToEdit) {
      const updatedStock = {...stock};
      orderToEdit.cart.forEach(item => {
         const key = String(item.id);
         if (updatedStock[key] !== undefined) {
           updatedStock[key] += item.cantidad;
         }
      });
      setStock(updatedStock);
      saveStock(updatedStock);

      deleteOrder(orderId);
      
      setCart([...orderToEdit.cart]);
      setCurrentOrderClient({...orderToEdit.cliente});
      setCurrentOrderPayment({...orderToEdit.pago});
      
      setActiveTab('Toma de Pedidos');
      setPosStep(1);
      setLastConfirmedOrder(null);
    }
  };

  const handleCancelOrder = (orderId: string, _fromLocation: 'kitchen' | 'ready') => {
    triggerModal({
      type: 'confirm',
      title: 'Cancelar Pedido',
      message: `¿Estás seguro que deseas cancelar el pedido #${orderId}? El stock de los productos será devuelto y el pedido desaparecerá.`,
      onConfirm: () => {
        const orderToCancel = dailyOrders.find(o => o.id === orderId);

        if (orderToCancel) {
          const updatedStock = {...stock};
          orderToCancel.cart.forEach(item => {
             const key = String(item.id);
             if (updatedStock[key] !== undefined) {
               updatedStock[key] += item.cantidad;
             }
          });
          setStock(updatedStock);
          saveStock(updatedStock);

          deleteOrder(orderId);
        }
        closeModal();
      }
    });
  };

  const handlePrintTicketWrapper = (order: Order | null) => {
    printTicket(order, (msg) => triggerModal({ type: 'alert', title: 'Aviso', message: msg, onConfirm: closeModal }));
  };

  if (showPresentation) {
      return <Presentacion onStartDemo={() => setShowPresentation(false)} />;
  }

  if (isLocked) {
    return (
      <AperturaCaja
        showOpeningForm={showOpeningForm}
        setShowOpeningForm={setShowOpeningForm}
        cajeroName={cajeroName}
        setCajeroName={setCajeroName}
        openingCash={openingCash}
        setOpeningCash={setOpeningCash}
        openingError={openingError}
        thresholds={thresholds}
        setThresholds={setThresholds}
        initialStockSetup={initialStockSetup}
        setInitialStockSetup={setInitialStockSetup}
        menuItems={menuItems}
        onOpenRegister={handleOpenRegister}
        onGoToPresentation={() => setShowPresentation(true)}
      />
    );
  }

  const demoSession = getLocalDemoSession();

  // If expired and not admin, lock out
  if ((demoSession.isExpired || isExpiredLocked) && !demoSession.isAdmin) {
    return (
      <ExpiredDemoLockScreen
        clientName={demoSession.clientName}
        onUnlocked={() => {
          setIsExpiredLocked(false);
        }}
        onGoToLanding={() => {
          setIsExpiredLocked(false);
          setShowPresentation(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-[#050505] text-white selection:bg-blue-500/30 relative select-none">
      {demoSession.isValid && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/30 text-emerald-300 text-xs py-1.5 px-4 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">
              {demoSession.isAdmin ? 'Modo Administrador Activo (Acceso Ilimitado)' : 'Sesión Demo Autorizada (24 Horas)'}
            </span>
            <span className="text-emerald-400/80 hidden sm:inline">
              | {demoSession.isAdmin ? 'Admin: JPZ207UI' : `Tiempo restante: ~${demoSession.remainingHours}h (${demoSession.clientName})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {demoSession.isAdmin && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="text-[11px] bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
              >
                Panel Demos
              </button>
            )}
            <button
              onClick={() => setShowPresentation(true)}
              className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      )}

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kitchenOrdersCount={kitchenOrders.length}
        readyOrders={readyOrders}
        onCerrarTurno={promptCerrarTurno}
        onGoToPresentation={() => setShowPresentation(true)}
        isAdmin={demoSession.isAdmin}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        userPlan={userPlan}
      />

      {activeTab === 'Toma de Pedidos' && (
        <POSModule
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          posStep={posStep}
          setPosStep={setPosStep}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          menuItems={menuItems}
          cart={cart}
          setCart={setCart}
          addToCart={addToCart}
          currentOrderClient={currentOrderClient}
          setCurrentOrderClient={setCurrentOrderClient}
          currentOrderPayment={currentOrderPayment}
          setCurrentOrderPayment={setCurrentOrderPayment}
          formErrors={formErrors}
          validateClientData={validateClientData}
          handleConfirmPedidoFinal={handleConfirmPedidoFinal}
          lastConfirmedOrder={lastConfirmedOrder}
          handleNewOrder={handleNewOrder}
          printTicketFn={handlePrintTicketWrapper}
          onOpenAIModal={(mode) => {
            setAiModalMode(mode);
            setIsAIModalOpen(true);
          }}
        />
      )}

      {activeTab === 'WhatsApp' && (
        userPlan === 'plan_basico' && !demoSession.isAdmin ? (
          <ModuleLockScreen
            moduleName="Bandeja de Entrada de WhatsApp & IA"
            requiredPlan="plan_pro"
            currentPlan={userPlan}
            onUpgradeSuccess={handlePlanUpgrade}
          />
        ) : (
          <WhatsAppInboxModule
            menuItems={menuItems}
            clients={clientsDB}
            onApplyParsedOrder={(parsed, directConfirm) => {
              handleApplyAIParsedOrder(parsed, directConfirm);
              if (directConfirm) {
                setActiveTab('Cocina');
              } else {
                setActiveTab('Toma de Pedidos');
              }
            }}
            onSaveNewClient={(newC) => {
              const nextClients = [...clientsDB, { id: 'c_' + Date.now(), ...newC }];
              setClientsDB(nextClients);
              saveClient({ id: 'c_' + Date.now(), ...newC });
            }}
          />
        )
      )}

      {activeTab === 'Módulo Web' && (
        userPlan !== 'plan_full' && !demoSession.isAdmin ? (
          <ModuleLockScreen
            moduleName="Módulo Web & App Clientes (Venta Directa)"
            requiredPlan="plan_full"
            currentPlan={userPlan}
            onUpgradeSuccess={handlePlanUpgrade}
          />
        ) : (
          <WebClientAppModule
            menuItems={menuItems}
            onNewWebOrder={(newOrder) => {
              setKitchenOrders(prev => [newOrder, ...prev]);
              setDailyOrders(prev => [newOrder, ...prev]);
              saveOrder(newOrder);
              triggerModal({
                type: 'alert',
                title: '¡Nuevo Pedido Web Recibido!',
                message: `El cliente ${newOrder.cliente.nombre} ha enviado un pedido desde la App Web (#${newOrder.id}) por un total de $${newOrder.total}. Ha ingresado a la Cocina KDS.`,
                onConfirm: closeModal,
              });
            }}
          />
        )
      )}

      {activeTab === 'Cocina' && (
        userPlan === 'plan_basico' && !demoSession.isAdmin ? (
          <ModuleLockScreen
            moduleName="Monitor KDS de Cocina en Tiempo Real"
            requiredPlan="plan_pro"
            currentPlan={userPlan}
            onUpgradeSuccess={handlePlanUpgrade}
          />
        ) : (
          <KDSModule
            kitchenOrders={kitchenOrders}
            currentTime={currentTime}
            markAsDone={markAsDone}
            handleEditOrder={handleEditOrder}
            handleCancelOrder={handleCancelOrder}
          />
        )
      )}

      {activeTab === 'Mostrador' && (
        <OrderBoard
          title="Retiro Local"
          icon={<span className="text-blue-400">📦</span>}
          orders={readyOrders.filter(o => o.pago.tipo === 'local')}
          currentTime={currentTime}
          markAsDelivered={markAsDelivered}
          handleEditOrder={handleEditOrder}
          handleCancelOrder={handleCancelOrder}
        />
      )}

      {activeTab === 'Mesas' && (
        <OrderBoard
          title="Mesas en Salón"
          icon={<span className="text-purple-400">🍽️</span>}
          orders={readyOrders.filter(o => o.pago.tipo === 'mesa')}
          currentTime={currentTime}
          markAsDelivered={markAsDelivered}
          handleEditOrder={handleEditOrder}
          handleCancelOrder={handleCancelOrder}
        />
      )}

      {activeTab === 'Delivery' && (
        <OrderBoard
          title="Envíos Pendientes"
          icon={<span className="text-emerald-400">🛵</span>}
          orders={readyOrders.filter(o => o.pago.tipo === 'envio')}
          currentTime={currentTime}
          markAsDelivered={markAsDelivered}
          handleEditOrder={handleEditOrder}
          handleCancelOrder={handleCancelOrder}
        />
      )}

      {activeTab === 'Finalizados' && (
        <FinalizadosView
          dailyOrders={dailyOrders}
          printTicketFn={handlePrintTicketWrapper}
        />
      )}

      {activeTab === 'Clientes' && (
        <ClientesModule
          clientsDB={clientsDB}
          setClientsDB={setClientsDB}
          triggerModal={triggerModal}
          closeModal={closeModal}
        />
      )}

      {activeTab === 'Menú' && (
        <MenuModule
          menuItems={menuItems}
          setMenuItems={setMenuItems}
          triggerModal={triggerModal}
          closeModal={closeModal}
        />
      )}

      {activeTab === 'Stock' && (
        userPlan === 'plan_basico' && !demoSession.isAdmin ? (
          <ModuleLockScreen
            moduleName="Control de Stock & Insumos Críticos"
            requiredPlan="plan_pro"
            currentPlan={userPlan}
            onUpgradeSuccess={handlePlanUpgrade}
          />
        ) : (
          <StockModule
            menuItems={menuItems}
            stock={stock}
            setStock={setStock}
            thresholds={thresholds}
          />
        )
      )}

      {activeTab === 'Facturación' && (
        userPlan !== 'plan_vip' && !demoSession.isAdmin ? (
          <ModuleLockScreen
            moduleName="Facturación Electrónica & CFE DGI"
            requiredPlan="plan_vip"
            currentPlan={userPlan}
            onUpgradeSuccess={handlePlanUpgrade}
          />
        ) : (
          <FacturacionModule
            orders={dailyOrders}
          />
        )
      )}

      {activeTab === 'Reportes' && (
        userPlan === 'plan_basico' && !demoSession.isAdmin ? (
          <ModuleLockScreen
            moduleName="Reportes Avanzados & Cierres Mensuales"
            requiredPlan="plan_pro"
            currentPlan={userPlan}
            onUpgradeSuccess={handlePlanUpgrade}
          />
        ) : (
          <ReportesModule
            dailyOrders={dailyOrders}
            historicalTurns={historicalTurns}
            monthlyClosings={monthlyClosings}
            onSaveMonthlyClosing={handleSaveMonthlyClosing}
            onDeleteMonthlyClosing={handleDeleteMonthlyClosing}
            openingCash={openingCash}
            cajeroName={cajeroName}
            menuItems={menuItems}
          />
        )
      )}

      {activeTab === 'Historial' && (
        <HistorialModule
          historicalTurns={historicalTurns}
          setHistoricalTurns={setHistoricalTurns}
          triggerModal={triggerModal}
          closeModal={closeModal}
        />
      )}

      {activeTab === 'Caja' && (
        <ArqueoModule
          dailyOrders={dailyOrders}
          openingCash={openingCash}
          cajeroName={cajeroName}
          historicalTurns={historicalTurns}
          setHistoricalTurns={setHistoricalTurns}
          setIsCajaAbierta={(open) => {
            setIsCajaAbierta(open);
            saveAppState({ isCajaAbierta: open });
          }}
          setIsLocked={(locked) => {
            setIsLocked(locked);
            saveAppState({ isLocked: locked });
          }}
          setShowOpeningForm={(show) => {
            setShowOpeningForm(show);
            saveAppState({ showOpeningForm: show });
          }}
          setDailyOrders={() => {
            // Clear daily orders from firestore
            dailyOrders.forEach(o => deleteOrder(o.id));
          }}
          setKitchenOrders={() => {}}
          setReadyOrders={() => {}}
          triggerModal={triggerModal}
          closeModal={closeModal}
        />
      )}

      {activeTab === 'Soporte' && (
        <SoporteModule />
      )}

      <Modals
        modalConfig={modalConfig}
        closeModal={closeModal}
        paymentModalOrder={paymentModalOrder}
        setPaymentModalOrder={setPaymentModalOrder}
        payMesaMetodo={payMesaMetodo}
        setPayMesaMetodo={setPayMesaMetodo}
        payMesaAbono={payMesaAbono}
        setPayMesaAbono={setPayMesaAbono}
        payMesaPropina={payMesaPropina}
        setPayMesaPropina={setPayMesaPropina}
        finalizeDelivery={finalizeDelivery}
      />

      <AIOrderModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        menuItems={menuItems}
        clients={clientsDB}
        onApplyToOrder={handleApplyAIParsedOrder}
        initialMode={aiModalMode}
      />

      <AdminDemoPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}
