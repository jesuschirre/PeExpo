import { Minus, Plus, Send, ShoppingBag, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GetCategory } from '../supabase/CrudCategory';
import { InsertKardex } from '../supabase/CrudKardex';
import { CartItem, CategoryType, Order, Product } from '../types';

interface CustomerMenuProps {
  products: Product[];
  onCreateOrder: (order: Order) => void;
  hasActiveOrder: boolean;
}

export function CustomerMenu({ products, onCreateOrder, hasActiveOrder }: CustomerMenuProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const result = await GetCategory();
      if (!result.error) setCategories((result.data || []).filter(category => category.estado));
    };

    void loadCategories();
  }, []);

  const filteredProducts = useMemo(
    () => selectedCategoryId === null
      ? products
      : products.filter(product => product.id_categoria === selectedCategoryId),
    [products, selectedCategoryId]
  );

  const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.product.precio_venta * i.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((t, i) => t + i.quantity, 0), [cart]);

  const updateQuantity = (product: Product, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) return prev.filter((item) => item.product.id !== product.id);
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: newQuantity } : item);
      } else if (delta > 0) {
        return [...prev, { product, quantity: delta }];
      }
      return prev;
    });
  };
  const handleCheckout = async () => {
    const trimmedCustomerName = customerName.trim();
    if (!trimmedCustomerName || cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const kardexMovements = cart.map(item => ({
      id_producto: item.product.id,
      cantidad: item.quantity,
      estado: 'preparando',
      nombreCli: trimmedCustomerName,
      total: item.product.precio_venta * item.quantity,
    }));

    const { error } = await InsertKardex(kardexMovements);
    if (error) {
      Alert.alert('No se pudo confirmar la orden', error);
      setIsSubmitting(false);
      return;
    }

    onCreateOrder({
      id: Math.random().toString(36).substring(2, 9),
      customerName: trimmedCustomerName,
      items: cart,
      total: cartTotal,
      status: 'preparing',
      createdAt: Date.now(),
    });
    setCart([]);
    setIsCheckoutModalOpen(false);
    setCustomerName('');
    setIsSubmitting(false);
  };

  return (
    <View className="flex-1 bg-gray-50 pb-24">
      <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl">
        <Text className="text-3xl font-bold text-gray-900">Nuestro menú</Text>
        <Text className="text-gray-500 mt-1">Elige tus productos favoritos</Text>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerStyle={{ gap: 24, paddingBottom: 100 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedCategoryId(null)}
            className={`px-4 py-3 rounded-xl ${selectedCategoryId === null ? 'bg-black' : 'bg-white border border-gray-200'}`}
          >
            <Text className={selectedCategoryId === null ? 'text-white font-semibold' : 'text-gray-700'}>Todas</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              className={`px-4 py-3 rounded-xl ${selectedCategoryId === category.id ? 'bg-black' : 'bg-white border border-gray-200'}`}
            >
              <Text className={selectedCategoryId === category.id ? 'text-white font-semibold' : 'text-gray-700'}>
                {category.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredProducts.map((product) => (
          <View key={product.id} className="bg-white rounded-3xl p-4 border border-gray-100 flex-row items-center gap-4">
            <View className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden">
              {product.img ? (
                <Image source={{ uri: product.img }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="flex-1 items-center justify-center"><Text className="text-gray-400">No Image</Text></View>
              )}
            </View>
            
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-lg">{product.nombre}</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-black text-lg">£{product.precio_venta.toFixed(2)}</Text>
                
                <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <TouchableOpacity onPress={() => updateQuantity(product, -1)} className="w-8 h-8 items-center justify-center bg-white rounded-lg">
                    <Minus color="#4b5563" size={16} />
                  </TouchableOpacity>
                  <Text className="font-semibold w-4 text-center">{cart.find(i => i.product.id === product.id)?.quantity || 0}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(product, 1)} className="w-8 h-8 items-center justify-center bg-black rounded-lg">
                    <Plus color="white" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
        {filteredProducts.length === 0 && (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-gray-500">No hay productos en esta categoría.</Text>
          </View>
        )}
      </ScrollView>

      {cartItemCount > 0 && (
        <View className="absolute bottom-20 left-6 right-6">
          <TouchableOpacity onPress={() => setIsCheckoutModalOpen(true)} className="bg-green-500 rounded-2xl p-4 flex-row items-center justify-between shadow-lg">
            <View className="flex-row items-center gap-3">
              <View className="bg-white/20 rounded-xl p-2"><ShoppingBag color="white" size={24} /></View>
              <Text className="text-white font-semibold text-lg">{cartItemCount} items</Text>
            </View>
            <Text className="text-white font-bold text-xl">£{cartTotal.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Orden Modal */}
      <Modal visible={isCheckoutModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold">Confirmar orden</Text>
              <TouchableOpacity onPress={() => setIsCheckoutModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X color="gray" size={20} />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-60 mb-6" contentContainerStyle={{ gap: 16 }}>
              {cart.map((item) => (
                <View key={item.product.id} className="flex-row justify-between items-center">
                  <Text className="text-gray-700"><Text className="font-semibold text-black">{item.quantity}x </Text>{item.product.nombre}</Text>
                  <Text className="text-gray-700"><Text className="font-semibold text-black">{item.quantity}x </Text>{item.product.nombre}</Text>
                  <Text className="font-medium text-black">S/ {(item.product.precio_venta * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <View className="border-t border-gray-200 pt-4 flex-row justify-between items-center">
                <Text className="font-bold text-lg">Total</Text>
                <Text className="font-bold text-2xl">S/ {cartTotal.toFixed(2)}</Text>
              </View>
            </ScrollView>

            <View className="mb-8">
              <Text className="font-medium text-gray-700 mb-2">Tu nombre</Text>
              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter your name"
                className="border-2 border-gray-200 rounded-2xl p-4 text-lg"
              />
            </View>

            <TouchableOpacity 
              onPress={handleCheckout} 
              disabled={!customerName.trim() || isSubmitting}
              className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${customerName.trim() && !isSubmitting ? 'bg-black' : 'bg-gray-300'}`}
            >
              <Text className="text-white font-semibold text-lg">{isSubmitting ? 'Confirmando...' : 'Realizar pedido'}</Text>
              <Send color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}