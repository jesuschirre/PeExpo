import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { Product, Order, View as AppViewType, Category } from '../types';
import { CATEGORIES } from '../data'
import { Edit2, Trash2, Plus, CheckCircle, Clock } from 'lucide-react-native';

interface AdminViewProps {
  view: AppViewType;
  products: Product[];
  orders: Order[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrder: (order: Order) => void;
}

export function AdminView({ view, products, orders, onUpdateProducts, onUpdateOrder }: AdminViewProps) {
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.category) return;
    
    if (isEditing) {
      onUpdateProducts(products.map(p => p.id === isEditing.id ? { ...isEditing, ...formData } as Product : p));
    } else if (isAdding) {
      onUpdateProducts([...products, { id: Math.random().toString(36).substring(2, 9), ...formData } as Product]);
    }
    setIsEditing(null); setIsAdding(false); setFormData({});
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered');

  if (view === 'admin_orders') {
    return (
      <View className="flex-1 bg-gray-50 pb-20">
        <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl mb-6">
          <Text className="text-3xl font-bold text-gray-900">Live Orders</Text>
          <Text className="text-gray-500 mt-1">Manage incoming kitchen tickets</Text>
        </View>

        <ScrollView className="px-6 flex-1" contentContainerStyle={{ gap: 16 }}>
          {activeOrders.map(order => (
            <View key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="font-bold text-xl">{order.customerName}</Text>
                  <Text className="text-sm text-gray-500">Order #{order.id}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${order.status === 'pending' ? 'bg-orange-100' : order.status === 'preparing' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  <Text className={`text-xs font-bold uppercase ${order.status === 'pending' ? 'text-orange-700' : order.status === 'preparing' ? 'text-blue-700' : 'text-green-700'}`}>{order.status}</Text>
                </View>
              </View>
              
              <View className="mb-6 gap-2">
                {order.items.map(item => (
                  <Text key={item.product.id} className="font-medium text-sm">{item.quantity}x {item.product.name}</Text>
                ))}
              </View>

              {order.status === 'pending' && (
                <TouchableOpacity onPress={() => onUpdateOrder({...order, status: 'preparing'})} className="bg-black py-3 rounded-xl flex-row items-center justify-center gap-2">
                  <Clock color="white" size={16} /><Text className="text-white font-bold">Start Preparing</Text>
                </TouchableOpacity>
              )}
              {order.status === 'preparing' && (
                <TouchableOpacity onPress={() => onUpdateOrder({...order, status: 'ready'})} className="bg-green-500 py-3 rounded-xl flex-row items-center justify-center gap-2">
                  <CheckCircle color="white" size={16} /><Text className="text-white font-bold">Mark Ready</Text>
                </TouchableOpacity>
              )}
              {order.status === 'ready' && (
                <TouchableOpacity onPress={() => onUpdateOrder({...order, status: 'delivered'})} className="border-2 border-gray-200 py-3 rounded-xl items-center">
                  <Text className="text-gray-700 font-bold">Complete Order</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pb-20 relative">
      <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl mb-6">
        <Text className="text-3xl font-bold text-gray-900">Inventory</Text>
        <Text className="text-gray-500 mt-1">Manage products and pricing</Text>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerStyle={{ gap: 16 }}>
        {products.map(product => (
          <View key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex-row items-center justify-between">
             <View className="flex-1 pr-4">
               <Text className="font-bold text-lg">{product.name}</Text>
               <Text className="text-sm text-gray-500">{product.category}</Text>
               <Text className="font-semibold text-green-600 mt-1">£{product.price.toFixed(2)}</Text>
             </View>
             <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => { setIsEditing(product); setFormData(product); }} className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                  <Edit2 color="#4b5563" size={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onUpdateProducts(products.filter(p => p.id !== product.id))} className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center">
                  <Trash2 color="#ef4444" size={18} />
                </TouchableOpacity>
             </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => { setIsAdding(true); setFormData({ category: 'Burgers' }); }} className="absolute bottom-24 right-6 w-14 h-14 bg-black rounded-full items-center justify-center shadow-lg">
        <Plus color="white" size={24} />
      </TouchableOpacity>

      <Modal visible={!!(isEditing || isAdding)} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-4">
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-2xl font-bold mb-6">{isAdding ? 'Add Product' : 'Edit Product'}</Text>
            
            <View className="gap-4 mb-8">
              <View>
                <Text className="font-medium text-gray-700 mb-1">Name</Text>
                <TextInput value={formData.name || ''} onChangeText={t => setFormData({...formData, name: t})} className="border-2 border-gray-200 rounded-xl p-3" />
              </View>
              <View>
                <Text className="font-medium text-gray-700 mb-2">Category</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} onPress={() => setFormData({...formData, category: c})} className={`px-4 py-2 rounded-xl ${formData.category === c ? 'bg-black' : 'bg-gray-100'}`}>
                      <Text className={formData.category === c ? 'text-white' : 'text-gray-700'}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text className="font-medium text-gray-700 mb-1">Price (£)</Text>
                <TextInput keyboardType="numeric" value={formData.price?.toString() || ''} onChangeText={t => setFormData({...formData, price: parseFloat(t) || 0})} className="border-2 border-gray-200 rounded-xl p-3" />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => { setIsEditing(null); setIsAdding(false); }} className="flex-1 py-4 border-2 border-gray-200 rounded-2xl items-center">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProduct} disabled={!formData.name || !formData.price} className={`flex-1 py-4 rounded-2xl items-center ${formData.name && formData.price ? 'bg-black' : 'bg-gray-300'}`}>
                <Text className="font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}