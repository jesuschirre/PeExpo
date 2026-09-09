import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Role } from '../types';

interface LoginViewProps {
  onSelectRole: (role: Role) => void;
}

export function LoginView({ onSelectRole }: LoginViewProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <View className="bg-white rounded-3xl p-8 w-full max-w-md items-center border border-gray-100 shadow-sm">
        <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mb-6">
          <Text className="text-3xl">🍔</Text>
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome to QuickBite</Text>
        <Text className="text-gray-500 mb-8 text-center">Please select your role to continue.</Text>

        <View className="w-full gap-4">
          <TouchableOpacity
            onPress={() => onSelectRole('customer')}
            className="w-full bg-black rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-lg">Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSelectRole('admin')}
            className="w-full bg-white border-2 border-black rounded-2xl py-4 items-center"
          >
            <Text className="text-black font-semibold text-lg">Administrator</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}