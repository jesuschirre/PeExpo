import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, MapPin, Package, ListOrdered, LogOut } from 'lucide-react-native';
import { Role, View as AppViewType } from '../types';

interface BottomNavProps {
  role: Role;
  currentView: AppViewType;
  onViewChange: (view: AppViewType) => void;
  onLogout: () => void;
}

export function BottomNav({ role, currentView, onViewChange, onLogout }: BottomNavProps) {
  if (!role) return null;

  const items = role === 'customer' 
    ? [{ id: 'menu' as AppViewType, label: 'Menu', icon: Home }, { id: 'tracking' as AppViewType, label: 'Tracking', icon: MapPin }]
    : [{ id: 'admin_products' as AppViewType, label: 'Products', icon: Package }, { id: 'admin_orders' as AppViewType, label: 'Orders', icon: ListOrdered }];

  return (
    <View className="bg-white border-t border-gray-200 pb-6 pt-2">
      <View className="flex-row justify-around items-center h-16">
        {items.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <TouchableOpacity key={item.id} onPress={() => onViewChange(item.id)} className="items-center justify-center flex-1 h-full relative">
              {isActive && <View className="absolute top-0 w-12 h-1 bg-green-500 rounded-b-md" />}
              <Icon color={isActive ? "black" : "#6b7280"} size={24} strokeWidth={isActive ? 2.5 : 2} />
              <Text className={`text-[10px] font-medium mt-1 ${isActive ? 'text-black' : 'text-gray-500'}`}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={onLogout} className="items-center justify-center flex-1 h-full relative">
          <LogOut color="#6b7280" size={24} strokeWidth={2} />
          <Text className="text-[10px] font-medium text-gray-500 mt-1">Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}