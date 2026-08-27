import React, { useState, useEffect } from 'react';
import { ClientHeader } from './ClientHeader';
import { ClientOrderModule } from './ClientOrderModule';
import { ClientTrackingModule } from './ClientTrackingModule';
import { ClientInfoModule } from './ClientInfoModule';
import { MenuItem, Gusto, CartItem, OrderClient, OrderPayment, Order } from '../../types';
import { saveOrder } from '../../lib/firebase';

interface ClientAppContainerProps {
  menuItems: MenuItem[];
  orders: Order[];
  currentTime: number;
  onNewClientOrder: (newOrder: Order) => void;
  onSwitchToCRM: () => void;
  onGoToPresentation: () => void;
}

export function ClientAppContainer({
  menuItems,
  orders,
  currentTime,
  onNewClientOrder,
  onSwitchToCRM,
  onGoToPresentation,
}: ClientAppContainerProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'tracking' | 'info'>('menu');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [posStep, setPosStep] = useState(1);
  const [activeCategory, setActiveCategory] = useState('todas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastConfirmedOrder, setLastConfirmedOrder] = useState<Order | null>(null);

  // Client and Payment state (pre-filled if saved user exists)
  const [currentOrderClient, setCurrentOrderClient] = useState<OrderClient>(() => {
    try {
      const saved = localStorage.getItem('next_crm_client_user');
      if (saved) {
        const u = JSON.parse(saved);
        return { nombre: u.nombre || '', telefono: u.telefono || '', direccion: u.direccion || '', mesa: '' };
      }
    } catch {}
    return { nombre: '', telefono: '', direccion: '', mesa: '' };
  });

  const [currentOrderPayment, setCurrentOrderPayment] = useState<OrderPayment>({
    tipo: 'envio',
    metodo: 'efectivo',
    notas: '',
    programado: false,
    horaProgramada: '',
    abono: '',
    propina: '',
    cadete: 'Samuel',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const addToCart = (product: MenuItem, cant = 1, selectedGustos: Gusto[] = [], notas = '') => {
    const gustosExtraPrice = selectedGustos.reduce((sum, g) => sum + g.precio, 0);
    const unitPrice = product.precio + gustosExtraPrice;
    
    const newItem: CartItem = {
      productoId: product.id,
      nombre: product.nombre,
      precioUnitario: unitPrice,
      cantidad: cant,
      gustos: selectedGustos,
      notas: notas || (selectedGustos.length > 0 ? selectedGustos.map(g => g.nombre).join(', ') : undefined),
    };

    setCart(prev => [...prev, newItem]);
  };

  const validateClientData = () => {
    const errors: Record<string, string> = {};
    if (!currentOrderClient.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    if (!currentOrderClient.telefono.trim()) errors.telefono = 'El teléfono es obligatorio';
    if (currentOrderPayment.tipo === 'envio' && !currentOrderClient.direccion.trim()) {
      errors.direccion = 'La dirección de entrega es obligatoria';
    }
    if (currentOrderPayment.tipo === 'mesa' && !currentOrderClient.mesa.trim()) {
      errors.mesa = 'El número de mesa es obligatorio';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmPedidoFinal = () => {
    if (cart.length === 0) return;
    if (!validateClientData()) {
      alert('Por favor completa tus datos de contacto y entrega.');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    const orderId = Math.floor(10000 + Math.random() * 90000).toString();

    const newOrder: Order = {
      id: orderId,
      cliente: currentOrderClient,
      pago: currentOrderPayment,
      cart: [...cart],
      total,
      fecha: new Date().toLocaleDateString('es-UY'),
      horaPedido: new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      estado: 'recibido',
    };

    saveOrder(newOrder);
    onNewClientOrder(newOrder);
    setLastConfirmedOrder(newOrder);
    setCart([]);
    setActiveTab('tracking');
  };

  const activeOrdersCount = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'finalizado').length;

  return (
    <div className="w-full h-full flex flex-col bg-[#040814] overflow-hidden select-none">
      
      {/* CLIENT HEADER */}
      <ClientHeader
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        cartCount={cart.reduce((sum, it) => sum + it.cantidad, 0)}
        activeOrdersCount={activeOrdersCount}
        onGoToPresentation={onGoToPresentation}
        currentOrderClient={currentOrderClient}
        onSwitchToCRM={onSwitchToCRM}
        onSetClientUser={(user) => {
          setCurrentOrderClient({
            nombre: user.nombre,
            telefono: user.telefono,
            direccion: user.direccion,
            mesa: '',
          });
        }}
      />

      {/* CONTENT TABS */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {activeTab === 'menu' && (
          <ClientOrderModule
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
            handleNewOrder={() => {
              setLastConfirmedOrder(null);
              setActiveTab('menu');
            }}
            onGoToTracking={() => setActiveTab('tracking')}
          />
        )}

        {activeTab === 'tracking' && (
          <ClientTrackingModule
            orders={orders}
            currentTime={currentTime}
            onGoToMenu={() => setActiveTab('menu')}
          />
        )}

        {activeTab === 'info' && (
          <ClientInfoModule
            onGoToMenu={() => setActiveTab('menu')}
          />
        )}
      </main>

    </div>
  );
}
