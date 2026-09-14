import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from './components/BottomNav';
import { AuthContextProvider, useAuth } from './context/authContext';
import './global.css';
import { GetProducts } from './supabase/CrudProducts';
import { View as AppViewType, Order, Product, Role } from './types';
import { AdminCategoryView } from './views/AdminCategoryView';
import { AdminKardexView } from './views/AdminKardexView';
import { AdminView } from './views/AdminView';
import { CustomerView } from './views/CustomerView';
import { LoginAdmin } from './views/LoginAdmin';
import { LoginView } from './views/LoginView';
import RegisterView from './views/RegisterView';

function MainApp() {
  const { session, loading: authLoading, signOut } = useAuth();
  const [role, setRole] = useState<Role>(null);

  const [isAdminLogged, setIsAdminLogged] = useState(false); 
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [currentView, setCurrentView] = useState<AppViewType>('menu');
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // NUEVO: Estado para manejar la caída de internet
  const [connectionError, setConnectionError] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (session) {
      setRole('admin');
      setIsAdminLogged(true);
      if (currentView === 'menu' || currentView === 'tracking') {
        setCurrentView('admin_products');
      }
    } else {
      if (isAdminLogged) {
        setRole(null);
        setIsAdminLogged(false);
      }
    }
  }, [session]);

  // NUEVO: Separamos la función para poder reusarla en el botón de reintentar
  const loadProducts = async () => {
    setProductsLoading(true);
    setConnectionError(false); // Reiniciamos el error al intentar de nuevo
    
    const result = await GetProducts();

    if (result.error) {
      // En lugar de una alerta, activamos la pantalla de error
      setConnectionError(true);
      setProducts([]);
    } else {
      setProducts((result.data || []) as Product[]);
    }

    setProductsLoading(false);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  if (authLoading || productsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  // NUEVO: Pantalla amigable si no hay internet
  if (connectionError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-4xl mb-4">📶</Text>
        <Text className="text-xl font-bold text-gray-900 text-center mb-2">Error de conexión</Text>
        <Text className="text-gray-500 text-center mb-8">No pudimos conectar con el servidor. Verifica tu conexión a internet.</Text>
        
        <TouchableOpacity 
          onPress={loadProducts}
          className="bg-black py-4 px-8 rounded-xl"
        >
          <Text className="text-white font-bold text-lg">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!role) {
    return (
      <SafeAreaProvider>
        <LoginView 
          onSelectRole={(r) => { 
            setRole(r); 
            setCurrentView(r === 'customer' ? 'menu' : 'admin_products'); 
            setIsAdminLogged(false); 
          }} 
        />
      </SafeAreaProvider>
    );
  }

  if (role === 'admin' && isRegistering) {
    return (
      <SafeAreaProvider>
        <RegisterView 
          onRegisterSuccess={() => setIsRegistering(false)} 
          onBack={() => setIsRegistering(false)} 
        />
      </SafeAreaProvider>
    );
  }

  if (role === 'admin' && !isAdminLogged) {
    return (
      <SafeAreaProvider>
        <LoginAdmin 
          onLoginSuccess={() => setIsAdminLogged(true)} 
          onBack={() => setRole(null)} 
          onGoToRegister={() => setIsRegistering(true)}
        />
      </SafeAreaProvider>
    );
  }

  const activeCustomerOrder = orders
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50 relative">
        <View className="flex-1">
          {role === 'customer' && (
            <CustomerView
              view={currentView}
              products={products}
              orders={orders}
              onCreateOrder={order => setOrders(current => [...current, order])}
              onNavigateTracking={() => setCurrentView('tracking')}
            />
          )}
          {role === 'admin' && isAdminLogged && (
            currentView === 'admin_categories' ? <AdminCategoryView /> : currentView === 'admin_kardex' ? <AdminKardexView /> : <AdminView
                products={products}
                onUpdateProducts={setProducts}
              />
          )}
        </View>
        
        <View className="absolute bottom-0 left-0 right-0 bg-white">
          <BottomNav 
            role={role} 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            onLogout={async () => {
              if (role === 'admin') {
                await signOut();
              }
              setRole(null);
              setIsAdminLogged(false);
            }} 
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <MainApp />
    </AuthContextProvider>
  );
}