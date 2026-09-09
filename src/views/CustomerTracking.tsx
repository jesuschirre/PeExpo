import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Order } from '../types';
import { Map, Clock, CheckCircle, Package } from 'lucide-react-native';

interface CustomerTrackingProps {
  order: Order | undefined;
}

export function CustomerTracking({ order }: CustomerTrackingProps) {
  if (!order || order.status === 'delivered') {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-6">
          <Package color="#9ca3af" size={40} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</Text>
        <Text className="text-gray-500 text-center">Go to the menu to place a new order.</Text>
      </View>
    );
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'preparing', label: 'Preparing', icon: Package },
    { status: 'ready', label: 'Ready for Pickup', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

  return (
    <View className="flex-1 bg-gray-50 pb-20">
      <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl">
        <Text className="text-3xl font-bold text-gray-900">Order Tracking</Text>
        <Text className="text-gray-500 mt-1">Order #{order.id.toUpperCase()}</Text>
      </View>

      <ScrollView className="p-6 flex-1" contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        {/* Status Timeline */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <Text className="font-bold text-lg mb-6">Status</Text>
          <View className="relative">
            {/* Connecting line */}
            <View className="absolute left-[27px] top-4 bottom-4 w-1 bg-gray-100 rounded-full" />
            
            <View className="gap-8 relative">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isActive = index === currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <View key={step.status} className="flex-row items-center gap-6">
                    <View className={`w-14 h-14 rounded-full items-center justify-center relative z-10 ${
                      isActive ? 'bg-black border-4 border-white shadow-md' 
                      : isCompleted ? 'bg-green-500' 
                      : 'bg-gray-100'
                    }`}>
                      <Icon color={isActive || isCompleted ? "white" : "#9ca3af"} size={24} />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold text-lg ${isActive ? 'text-black' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </Text>
                      {isActive && (
                        <Text className="text-sm text-gray-500 mt-1">
                          {step.status === 'pending' && 'Waiting for kitchen...'}
                          {step.status === 'preparing' && 'Your food is being prepared!'}
                          {step.status === 'ready' && 'Your order is ready to collect!'}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {/* Map Placeholder */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 h-64 mb-10">
          <Text className="font-bold text-lg mb-4 px-2">Location</Text>
          <View className="flex-1 bg-blue-50 rounded-2xl border-2 border-blue-100 items-center justify-center overflow-hidden">
             <View className="items-center">
               <View className="w-12 h-12 bg-black rounded-full items-center justify-center shadow-lg mb-2">
                 <Map color="white" size={24} />
               </View>
               <View className="bg-white px-4 py-2 rounded-xl shadow-md">
                 <Text className="font-semibold text-sm text-black">QuickBite Store</Text>
               </View>
             </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}