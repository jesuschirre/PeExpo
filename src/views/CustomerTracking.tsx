import { CheckCircle, Clock, Package, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { GetKardex } from '../supabase/CrudKardex';
import { Order, OrderStatus } from '../types';

interface CustomerTrackingProps {
  orders: Order[];
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pedido recibido',
  preparing: 'Preparando',
  processing: 'En proceso',
  delivered: 'Terminado',
  cancelled: 'Cancelado',
};

const statusDescriptions: Record<OrderStatus, string> = {
  pending: 'Estamos preparando tu pedido.',
  preparing: 'Tu pedido se está preparando.',
  processing: 'Tu pedido está siendo procesado.',
  delivered: 'Tu pedido está terminado. Gracias por tu compra.',
  cancelled: 'Este pedido fue cancelado y no puede modificarse.',
};

const statusSteps: Array<{ status: OrderStatus; label: string; icon: typeof Clock }> = [
  { status: 'pending', label: 'Pedido recibido', icon: Clock },
  { status: 'preparing', label: 'Preparando', icon: Package },
  { status: 'processing', label: 'En proceso', icon: Clock },
  { status: 'delivered', label: 'Terminado', icon: CheckCircle },
];

export function CustomerTracking({ orders }: CustomerTrackingProps) {
  const [statuses, setStatuses] = useState<Record<string, OrderStatus>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatuses = async () => {
      const result = await GetKardex();
      if (!result.error && result.data) {
        const nextStatuses: Record<string, OrderStatus> = {};

        orders.forEach(order => {
          const orderMovements = result.data
            .filter(movement => movement.nombreCli === order.customerName)
            .filter(movement => new Date(movement.date).getTime() >= order.createdAt - 10000)
            .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
          const status = orderMovements[0]?.estado.toLowerCase();

          nextStatuses[order.id] = status === 'cancelado'
            ? 'cancelled'
            : status === 'terminado'
              ? 'delivered'
              : status === 'procesando'
                ? 'processing'
                : status === 'preparado' || status === 'preparando'
                  ? 'preparing'
                  : order.status;
        });

        setStatuses(nextStatuses);
      }
      setLoading(false);
    };

    void loadStatuses();
    const interval = setInterval(() => void loadStatuses(), 5000);
    return () => clearInterval(interval);
  }, [orders]);

  if (loading && orders.length === 0) {
    return <ActivityIndicator className="flex-1" size="large" color="#111827" />;
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-6">
          <Package color="#9ca3af" size={40} />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Sin pedidos</Text>
        <Text className="text-gray-500 text-center">Realiza un pedido desde el menú para verlo aquí.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pb-20">
      <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl">
        <Text className="text-3xl font-bold text-gray-900">Mis pedidos</Text>
        <Text className="text-gray-500 mt-1">Consulta el proceso de cada pedido</Text>
      </View>

      <ScrollView className="p-6 flex-1" contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
        {orders.slice().sort((first, second) => second.createdAt - first.createdAt).map(order => {
          const currentStatus = statuses[order.id] || order.status;
          const currentStepIndex = statusSteps.findIndex(step => step.status === currentStatus);

          return (
            <View key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-xl text-gray-900">Pedido #{order.id.toUpperCase()}</Text>
                  <Text className="text-gray-500 mt-1">{statusLabels[currentStatus]}</Text>
                </View>
                {currentStatus === 'cancelled' ? <XCircle color="#dc2626" size={26} /> : <Package color="#111827" size={26} />}
              </View>

              <View className="border-t border-gray-100 pt-3 mb-4">
                {order.items.map(item => (
                  <View key={item.product.id} className="flex-row justify-between py-1">
                    <Text className="text-gray-700 flex-1">
                      <Text className="font-semibold text-black">{item.quantity}x </Text>
                      {item.product.nombre}
                    </Text>
                    <Text className="font-medium text-black">S/ {(item.product.precio_venta * item.quantity).toFixed(2)}</Text>
                  </View>
                ))}
                <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
                  <Text className="font-bold">Total</Text>
                  <Text className="font-bold">S/ {order.total.toFixed(2)}</Text>
                </View>
              </View>

              {currentStatus === 'cancelled' ? (
                <Text className="text-red-600 font-medium">{statusDescriptions[currentStatus]}</Text>
              ) : (
                <>
                  <View className="relative gap-4">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isActive = index === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <View key={step.status} className="flex-row items-center gap-3">
                          <View className={`w-10 h-10 rounded-full items-center justify-center ${isActive ? 'bg-black' : isCompleted ? 'bg-green-500' : 'bg-gray-100'}`}>
                            <Icon color={isActive || isCompleted ? 'white' : '#9ca3af'} size={19} />
                          </View>
                          <Text className={`font-semibold ${isActive ? 'text-black' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text className="text-sm text-gray-500 mt-4">{statusDescriptions[currentStatus]}</Text>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
