import { GetCategory } from '@/supabase/CrudCategory';
import * as ImagePicker from 'expo-image-picker';
import { Edit2, ImagePlus, Plus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DeleteProduct, InsertProduct, UpdateProduct, UploadProductImage } from '../supabase/CrudProducts';
import { CategoryType, Product } from '../types';
interface AdminViewProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
}

export function AdminView({ products, onUpdateProducts }: AdminViewProps) {
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({ estado: true, stock_actual: 0 });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const result = await GetCategory();
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }
      setCategories(result.data || []);
    };

    void loadCategories();
  }, []);

  const closeForm = () => {
    setIsEditing(null);
    setIsAdding(false);
    setFormData({ estado: true, stock_actual: 0 });
    setSelectedImage(null);
    setImageUrl('');
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Permite el acceso a tus fotos para elegir una imagen.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setImageUrl('');
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.nombre || !formData.id_categoria || formData.precio_venta === undefined) return;
    setIsSaving(true);
    const payload = {
      nombre: formData.nombre,
      id_categoria: formData.id_categoria,
      precio_venta: Number(formData.precio_venta),
      stock_actual: Number(formData.stock_actual || 0),
      estado: formData.estado !== false,
      ...(imageUrl.trim() ? { img: imageUrl.trim() } : {}),
    };

    const result = isEditing
      ? await UpdateProduct(isEditing.id, payload)
      : await InsertProduct(payload);

    if (result.error || !result.data) {
      setIsSaving(false);
      Alert.alert('Error', result.error || 'No se pudo guardar el producto.');
      return;
    }

    let savedProduct = result.data as Product;
    if (selectedImage) {
      const imageResult = await UploadProductImage(selectedImage, savedProduct.id);
      if (imageResult.error || !imageResult.data) {
        setIsSaving(false);
        Alert.alert('Producto guardado', 'No se pudo subir la imagen seleccionada.');
      } else {
        const updated = await UpdateProduct(savedProduct.id, { img: imageResult.data });
        if (updated.data) savedProduct = updated.data as Product;
      }
    }

    onUpdateProducts(isEditing
      ? products.map(product => product.id === savedProduct.id ? savedProduct : product)
      : [...products, savedProduct]);
    setIsSaving(false);
    closeForm();
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert('Eliminar producto', `¿Deseas eliminar ${product.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const result = await DeleteProduct(product.id);
          if (result.error) {
            Alert.alert('Error', result.error);
            return;
          }
          onUpdateProducts(products.filter(item => item.id !== product.id));
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 pb-20 relative">
      <View className="pt-6 px-6 pb-6 bg-white shadow-sm rounded-b-3xl mb-6">
        <Text className="text-3xl font-bold text-gray-900">Inventario</Text>
        <Text className="text-gray-500 mt-1">Maneja los Productos</Text>
      </View>

      <ScrollView className="px-6 flex-1" contentContainerStyle={{ gap: 16 }}>
        {products.map(product => (
          <View key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex-row items-center justify-between">
             {product.img ? <Image source={{ uri: product.img }} className="w-16 h-16 rounded-2xl mr-3" /> : null}
             <View className="flex-1 pr-4">
               <Text className="font-bold text-lg">{product.nombre}</Text>
               <Text className="text-sm text-gray-500">{categories.find(category => category.id === product.id_categoria)?.nombre || product.id_categoria} · Stock: {product.stock_actual}</Text>
               <Text className="font-semibold text-green-600 mt-1">S/ {product.precio_venta.toFixed(2)}</Text>
             </View>
             <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => { setIsEditing(product); setFormData(product); setSelectedImage(null); setImageUrl(product.img || ''); }} className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                  <Edit2 color="#4b5563" size={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteProduct(product)} className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center">
                  <Trash2 color="#ef4444" size={18} />
                </TouchableOpacity>
             </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => { setIsAdding(true); setFormData({ id_categoria: categories[0]?.id, estado: true, stock_actual: 0 }); setSelectedImage(null); setImageUrl(''); }} className="absolute bottom-24 right-6 w-14 h-14 bg-black rounded-full items-center justify-center shadow-lg">
        <Plus color="white" size={24} />
      </TouchableOpacity>

      <Modal visible={!!(isEditing || isAdding)} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center px-4">
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-2xl font-bold mb-6">{isAdding ? 'Add Product' : 'Edit Product'}</Text>
            
            <ScrollView className="max-h-[520px]" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
              <TouchableOpacity onPress={pickImage} className="border-2 border-dashed border-gray-300 rounded-2xl p-4 items-center">
                {selectedImage || imageUrl ? <Image source={{ uri: selectedImage || imageUrl }} className="w-28 h-28 rounded-2xl" /> : <ImagePlus color="#6b7280" size={32} />}
                <Text className="text-gray-600 mt-2">Elegir imagen</Text>
              </TouchableOpacity>
              <View>
                <Text className="font-medium text-gray-700 mb-1">URL de la imagen</Text>
                <TextInput
                  value={imageUrl}
                  onChangeText={value => { setImageUrl(value); setSelectedImage(null); }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  className="border-2 border-gray-200 rounded-xl p-3"
                />
              </View>
              <View>
                <Text className="font-medium text-gray-700 mb-1">Nombre</Text>
                <TextInput value={formData.nombre || ''} onChangeText={nombre => setFormData({...formData, nombre})} className="border-2 border-gray-200 rounded-xl p-3" />
              </View>
              <View>
                <Text className="font-medium text-gray-700 mb-2">Category</Text>
                <View className="flex-row flex-wrap gap-2">
                  {categories.map(category => (
                    <TouchableOpacity key={category.id} onPress={() => setFormData({...formData, id_categoria: category.id})} className={`px-4 py-2 rounded-xl ${formData.id_categoria === category.id ? 'bg-black' : 'bg-gray-100'}`}>
                      <Text className={formData.id_categoria === category.id ? 'text-white' : 'text-gray-700'}>{category.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <Text className="font-medium text-gray-700 mb-1">Precio (£)</Text>
                <TextInput keyboardType="numeric" value={formData.precio_venta?.toString() || ''} onChangeText={value => setFormData({...formData, precio_venta: parseFloat(value) || 0})} className="border-2 border-gray-200 rounded-xl p-3" />
              </View>
              <View>
                <Text className="font-medium text-gray-700 mb-1">Stock</Text>
                <TextInput keyboardType="numeric" value={formData.stock_actual?.toString() || ''} onChangeText={value => setFormData({...formData, stock_actual: parseInt(value, 10) || 0})} className="border-2 border-gray-200 rounded-xl p-3" />
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-medium text-gray-700">Producto activo</Text>
                <Switch value={formData.estado !== false} onValueChange={estado => setFormData({...formData, estado})} />
              </View>
            </ScrollView>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={closeForm} className="flex-1 py-4 border-2 border-gray-200 rounded-2xl items-center">
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProduct} disabled={isSaving || !formData.nombre || formData.precio_venta === undefined} className={`flex-1 py-4 rounded-2xl items-center ${isSaving || !formData.nombre || formData.precio_venta === undefined ? 'bg-gray-300' : 'bg-black'}`}>
                {isSaving ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}