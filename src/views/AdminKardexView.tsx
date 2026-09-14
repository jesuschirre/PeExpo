import { KardexConNombre } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GetKardex, UpdateKardex } from '../supabase/CrudKardex';

type GroupedMovement = {
  id: number;
  cliente: string;
  date: string;
  cantidad: number;
  total: number;
  estado: string;
  productos: string[];
  movementIds: number[];
};

export function AdminKardexView() {
  const [movements, setMovements] = useState<KardexConNombre[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingGroupId, setUpdatingGroupId] = useState<number | null>(null);

  const loadKardex = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const result = await GetKardex();
    if (result.error) Alert.alert('Error', result.error);
    else setMovements(result.data || []);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void loadKardex();
  }, []);

  const groupedMovements = useMemo(() => {
    const groups: Record<string, GroupedMovement> = {};

    movements.forEach(movement => {
      const cliente = movement.nombreCli || 'Sin cliente';
      const date = movement.date || 'Sin fecha';
      const key = `${cliente}-${date}`;
      const nombreProducto = movement.id_producto?.nombre || 'Desconocido';

      if (!groups[key]) {
        groups[key] = {
          id: movement.id,
          cliente,
          date,
          cantidad: movement.cantidad,
          total: movement.total || 0,
          estado: movement.estado,
          productos: [nombreProducto],
          movementIds: [movement.id]
        };
      } else {
        groups[key].cantidad += movement.cantidad;
        groups[key].total += (movement.total || 0);
        groups[key].movementIds.push(movement.id);
        
        if (!groups[key].productos.includes(nombreProducto)) {
          groups[key].productos.push(nombreProducto);
        }
      }
    });

    return Object.values(groups);
  }, [movements]);

  const changeGroupStatus = async (group: GroupedMovement, nextStatus: string) => {
    if (updatingGroupId !== null) return;

    setUpdatingGroupId(group.id);
    const results = await Promise.all(
      group.movementIds.map(id => UpdateKardex(id, { estado: nextStatus }))
    );
    const error = results.find(result => result.error)?.error;

    if (error) {
      Alert.alert('No se pudo actualizar el estado', error);
    } else {
      setMovements(current => current.map(movement => (
        group.movementIds.includes(movement.id)
          ? { ...movement, estado: nextStatus }
          : movement
      )));
    }
    setUpdatingGroupId(null);
  };

  return (
    <View className="flex-1 bg-gray-50 pb-20">
      <View className="pt-6 px-6 pb-6 bg-white rounded-b-3xl mb-6">
        <Text className="text-3xl font-bold text-gray-900">Kardex</Text>
        <Text className="text-gray-500 mt-1">Movimientos consolidados por cliente</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#111827" />
      ) : (
        <ScrollView
          className="px-6 flex-1"
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadKardex(true)} />}
        >
          {groupedMovements.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-gray-500">No hay movimientos registrados.</Text>
            </View>
          ) : groupedMovements.map(group => {
            const estado = group.estado.toLowerCase();
            const nextStatus = estado === 'preparado' || estado === 'preparando'
              ? 'procesando'
              : estado === 'procesando'
                ? 'terminado'
                : null;
            const canCancel = !['terminado', 'cancelado'].includes(estado);

            return (
              <View key={group.id} className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-4">
                    <Text className="font-bold text-lg text-gray-900">
                      Cliente: {group.cliente}
                    </Text>
                    <Text className="text-xs text-gray-400 font-medium mt-1">
                      {group.date === 'Sin fecha'
                        ? group.date
                        : new Date(group.date).toLocaleString()}
                    </Text>
                  </View>
                  
                  <Text className={`font-bold text-lg ${group.cantidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {group.cantidad >= 0 ? '+' : ''}{group.cantidad} items
                  </Text>
                </View>
                
                <Text className="text-gray-600 font-medium mt-1">
                  Productos: <Text className="font-normal">{group.productos.join(', ')}</Text>
                </Text>
                
                <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-50">
                  <Text className="text-gray-500">Estado: {group.estado || 'Sin estado'}</Text>
                  <Text className="text-gray-800 font-bold">Total: S/ {group.total}</Text>
                </View>

                {nextStatus && (
                  <TouchableOpacity
                    onPress={() => void changeGroupStatus(group, nextStatus)}
                    disabled={updatingGroupId !== null}
                    className={`mt-4 rounded-xl py-3 items-center ${updatingGroupId === group.id ? 'bg-gray-300' : 'bg-black'}`}
                  >
                    <Text className="text-white font-semibold">
                      {updatingGroupId === group.id
                        ? 'Actualizando...'
                        : nextStatus === 'procesando'
                          ? 'Cambiar a procesando'
                          : 'Marcar como terminado'}
                    </Text>
                  </TouchableOpacity>
                )}

                {canCancel && (
                  <TouchableOpacity
                    onPress={() => void changeGroupStatus(group, 'cancelado')}
                    disabled={updatingGroupId !== null}
                    className="mt-3 rounded-xl py-3 items-center border border-red-200"
                  >
                    <Text className="text-red-600 font-semibold">Cancelar pedido</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}