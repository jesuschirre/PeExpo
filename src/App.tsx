import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Product, Order, Role, View as AppViewType } from './types';
import { INITIAL_PRODUCTS } from './data';
import { CustomerView } from './views/CustomerView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';
import { BottomNav } from './components/BottomNav';
import './global.css';

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [currentView, setCurrentView] = useState<AppViewType>('menu');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);

  if (!role) {
    return (
      <SafeAreaProvider>
        <LoginView 
          onSelectRole={(r) => { 
            setRole(r); 
            setCurrentView(r === 'customer' ? 'menu' : 'admin_products'); 
          }} 
        />
      </SafeAreaProvider>
    );
  }

  const activeCustomerOrder = orders
    .filter(o => o.status !== 'delivered')
    .sort((a, b) => b.createdAt - a.createdAt)[0];

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50 relative">
        <View className="flex-1">
          {role === 'customer' && (
            <CustomerView
              view={currentView}
              products={products}
              activeOrder={activeCustomerOrder}
              onCreateOrder={(o) => setOrders([...orders, o])}
              onNavigateTracking={() => setCurrentView('tracking')}
            />
          )}
          {role === 'admin' && (
            <AdminView
              view={currentView}
              products={products}
              orders={orders}
              onUpdateProducts={setProducts}
              onUpdateOrder={(updatedOrder) => setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o))}
            />
          )}
        </View>
        
        {/* Navegación inferior flotante */}
        <View className="absolute bottom-0 left-0 right-0 bg-white">
          <BottomNav 
            role={role} 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            onLogout={() => setRole(null)} 
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}