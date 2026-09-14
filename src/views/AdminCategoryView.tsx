import { Edit2, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DeleteCategory, GetCategory, InsertCategory, UpdateCategory } from '../supabase/CrudCategory';
import { CategoryType } from '../types';

const emptyForm = { nombre: '', descripcion: '', estado: true };

export function AdminCategoryView() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const result = await GetCategory();
    setLoading(false);
    if (result.error) Alert.alert('Error', result.error);
    else setCategories(result.data || []);
  };

  useEffect(() => { void loadCategories(); }, []);

  const closeForm = () => {
    setVisible(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const saveCategory = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const result = editing
      ? await UpdateCategory(editing.id, { nombre: form.nombre.trim(), descripcion: form.descripcion.trim(), estado: form.estado })
      : await InsertCategory({ ...form, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() });
    setSaving(false);

    if (result.error || !result.data) {
      Alert.alert('Error', result.error || 'No se pudo guardar la categoría.');
      return;
    }

    setCategories(current => editing
      ? current.map(category => category.id === result.data!.id ? result.data! : category)
      : [...current, result.data!]);
    closeForm();
  };

  const removeCategory = (category: CategoryType) => {
    Alert.alert('Eliminar categoría', `¿Deseas eliminar ${category.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        const result = await DeleteCategory(category.id);
        if (result.error) Alert.alert('Error', result.error);
        else setCategories(current => current.filter(item => item.id !== category.id));
      } },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 pb-20">
      <View className="pt-6 px-6 pb-6 bg-white rounded-b-3xl mb-6">
        <Text className="text-3xl font-bold text-gray-900">Categorías</Text>
        <Text className="text-gray-500 mt-1">Administra las categorías de tus productos</Text>
      </View>
      <ScrollView className="px-6 flex-1" contentContainerStyle={{ gap: 12 }}>
        {loading ? <ActivityIndicator size="large" color="#111827" /> : categories.map(category => (
          <View key={category.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center">
            <View className="flex-1">
              <Text className="font-bold text-lg">{category.nombre}</Text>
              {!!category.descripcion && <Text className="text-gray-500 mt-1">{category.descripcion}</Text>}
              <Text className={`text-xs mt-2 font-semibold ${category.estado ? 'text-green-600' : 'text-gray-400'}`}>
                {category.estado ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { setEditing(category); setForm({ nombre: category.nombre, descripcion: category.descripcion || '', estado: category.estado }); setVisible(true); }} className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-2">
              <Edit2 color="#4b5563" size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeCategory(category)} className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center">
              <Trash2 color="#ef4444" size={18} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity onPress={() => { setEditing(null); setForm(emptyForm); setVisible(true); }} className="absolute bottom-24 right-6 w-14 h-14 bg-black rounded-full items-center justify-center">
        <Plus color="white" size={24} />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-4">
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-2xl font-bold mb-6">{editing ? 'Editar categoría' : 'Nueva categoría'}</Text>
            <Text className="font-medium text-gray-700 mb-1">Nombre</Text>
            <TextInput value={form.nombre} onChangeText={nombre => setForm({ ...form, nombre })} className="border-2 border-gray-200 rounded-xl p-3 mb-4" />
            <Text className="font-medium text-gray-700 mb-1">Descripción</Text>
            <TextInput value={form.descripcion} onChangeText={descripcion => setForm({ ...form, descripcion })} multiline className="border-2 border-gray-200 rounded-xl p-3 mb-4 min-h-20" />
            <View className="flex-row items-center justify-between mb-6">
              <Text className="font-medium text-gray-700">Categoría activa</Text>
              <Switch value={form.estado} onValueChange={estado => setForm({ ...form, estado })} />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={closeForm} className="flex-1 py-4 border-2 border-gray-200 rounded-2xl items-center"><Text className="font-bold text-gray-700">Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveCategory} disabled={saving || !form.nombre.trim()} className={`flex-1 py-4 rounded-2xl items-center ${saving || !form.nombre.trim() ? 'bg-gray-300' : 'bg-black'}`}>
                {saving ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}