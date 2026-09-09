import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput } from 'react-native';
import { Product, Category, CartItem, Order } from '../types';
import { CATEGORIES } from '../data';
import { Plus, Minus, ShoppingBag, X, Send } from 'lucide-react-native';

interface CustomerMenuProps {
  products: Product[];
  onCreateOrder: (order: Order) => void;
  hasActiveOrder: boolean;
}

export function CustomerMenu({ products, onCreateOrder, hasActiveOrder }: CustomerMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Burgers');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const filteredProducts = useMemo(
    () => products.filter((p) => p.category === selectedCategory),
    [products, selectedCategory]
  );

  const cartTotal = useMemo(() => cart.reduce((t, i) => t + i.product.price * i.quantity, 0), [cart]);
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

  const handleCheckout = () => {
    if (!customerName.trim()) return;
    onCreateOrder({
      id: Math.random().toString(36).substring(2, 9),
      customerName,
      items: cart,
      total: cartTotal,
      status: 'pending',
      createdAt: Date.now(),
    });
    setCart([]);
    setIsCheckoutModalOpen(false);
    setCustomerName('');
  };

  return (
    <View className="flex-1 bg-gray-50 pb-24">
      <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl">
        <Text className="text-3xl font-bold text-gray-900">Our Menu</Text>
        <Text className="text-gray-500 mt-1">What are you craving today?</Text>
      </View>

      <View className="py-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ gap: 12, paddingRight: 48 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-2xl ${selectedCategory === cat ? 'bg-black' : 'bg-white border border-gray-200'}`}
            >
              <Text className={`font-semibold ${selectedCategory === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerStyle={{ gap: 24, paddingBottom: 100 }}>
        {filteredProducts.map((product) => (
          <View key={product.id} className="bg-white rounded-3xl p-4 border border-gray-100 flex-row items-center gap-4">
            <View className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden">
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="flex-1 items-center justify-center"><Text className="text-gray-400">No Image</Text></View>
              )}
            </View>
            
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-lg">{product.name}</Text>
              <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>{product.description}</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-black text-lg">£{product.price.toFixed(2)}</Text>
                
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

      {/* Checkout Modal */}
      <Modal visible={isCheckoutModalOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold">Confirm Order</Text>
              <TouchableOpacity onPress={() => setIsCheckoutModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X color="gray" size={20} />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-60 mb-6" contentContainerStyle={{ gap: 16 }}>
              {cart.map((item) => (
                <View key={item.product.id} className="flex-row justify-between items-center">
                  <Text className="text-gray-700"><Text className="font-semibold text-black">{item.quantity}x </Text>{item.product.name}</Text>
                  <Text className="font-medium text-black">£{(item.product.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
              <View className="border-t border-gray-200 pt-4 flex-row justify-between items-center">
                <Text className="font-bold text-lg">Total</Text>
                <Text className="font-bold text-2xl">£{cartTotal.toFixed(2)}</Text>
              </View>
            </ScrollView>

            <View className="mb-8">
              <Text className="font-medium text-gray-700 mb-2">Your Name</Text>
              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter your name"
                className="border-2 border-gray-200 rounded-2xl p-4 text-lg"
              />
            </View>

            <TouchableOpacity 
              onPress={handleCheckout} 
              disabled={!customerName.trim()}
              className={`rounded-2xl py-4 flex-row items-center justify-center gap-2 ${customerName.trim() ? 'bg-black' : 'bg-gray-300'}`}
            >
              <Text className="text-white font-semibold text-lg">Place Order</Text>
              <Send color="white" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}