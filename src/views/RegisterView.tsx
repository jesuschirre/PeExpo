import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RegisterUser } from '../supabase/auth';

interface RegisterViewProps {
    onRegisterSuccess: () => void;
    onBack: () => void;
}

export default function RegisterView({ onRegisterSuccess, onBack }: RegisterViewProps) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [telefono, setTelefono] = useState("");
    const [loading, setLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function registrar() {
        setUserError(null);

        // Validaciones
        if (!nombre.trim() || !apellido.trim() || !email.trim() || !pass.trim() || !telefono.trim()) {
            setUserError("Todos los campos son obligatorios.");
            return;
        }

        if (pass !== confirmPass) {
            setUserError("Las contraseñas no coinciden.");
            return;
        }

        if (pass.length < 6) {
            setUserError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await RegisterUser(email, pass, nombre, apellido, telefono);

            if (error) {
                console.error("🔴 Error en registro:", error);

                if (typeof error === 'string' && error.includes("already registered")) {
                    setUserError("Este correo ya está registrado. Intenta iniciar sesión.");
                } else {
                    setUserError(typeof error === 'string' ? error : "Ocurrió un error durante el registro.");
                }
            } else if (data) {
                console.log("✅ Registro exitoso:", data);
                setSuccess(true);
            }
        } catch (err: any) {
            console.error("🔴 Excepción inesperada en RegisterView:", err);
            setUserError("Error de conexión. Verifica tu internet y vuelve a intentar.");
        } finally {
            setLoading(false);
        }
    }

    // Pantalla de éxito
    if (success) {
        return (
            <View className="flex-1 bg-gray-50 justify-center px-6">
                <View className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm items-center gap-4">
                    <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center">
                        <Text className="text-3xl">✓</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 text-center">¡Registro exitoso!</Text>
                    <Text className="text-gray-500 text-center">
                        Tu cuenta ha sido creada. Revisa tu correo para confirmar tu cuenta y luego inicia sesión.
                    </Text>
                    <TouchableOpacity
                        onPress={onRegisterSuccess}
                        className="mt-4 w-full py-4 rounded-xl bg-black items-center"
                    >
                        <Text className="text-white font-bold text-lg">Ir a Iniciar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View className="pt-16 px-6 pb-6 bg-white shadow-sm rounded-b-3xl mb-6">
                <Text className="text-3xl font-bold text-gray-900">Crear Cuenta</Text>
                <Text className="text-gray-500 mt-1">Crea tu cuenta para comenzar a gestionar pedidos</Text>
            </View>

            <ScrollView className="px-6 flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">

                    {/* Alerta de error */}
                    {userError && (
                        <View className="bg-red-50 p-4 rounded-2xl border border-red-200">
                            <Text className="text-red-700 font-medium text-sm text-center">
                                {userError}
                            </Text>
                        </View>
                    )}

                    {/* Datos personales */}
                    <Text className="text-lg font-bold text-gray-900">Datos personales</Text>

                    <View>
                        <Text className="font-medium text-gray-700 mb-2">Nombre</Text>
                        <TextInput
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Juan"
                            className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                        />
                    </View>

                    <View>
                        <Text className="font-medium text-gray-700 mb-2">Apellido</Text>
                        <TextInput
                            value={apellido}
                            onChangeText={setApellido}
                            placeholder="Pérez"
                            className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                        />
                    </View>

                    <View>
                        <Text className="font-medium text-gray-700 mb-2">Teléfono</Text>
                        <TextInput
                            value={telefono}
                            onChangeText={setTelefono}
                            placeholder="+51 999 999 999"
                            keyboardType="phone-pad"
                            className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                        />
                    </View>

                    {/* Cuenta */}
                    <View className="border-t border-gray-100 pt-4 mt-2">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Cuenta</Text>

                        <View>
                            <Text className="font-medium text-gray-700 mb-2">Correo electrónico</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="admin@ejemplo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                            />
                        </View>

                        <View className="mt-4">
                            <Text className="font-medium text-gray-700 mb-2">Contraseña</Text>
                            <TextInput
                                value={pass}
                                onChangeText={setPass}
                                placeholder="Mínimo 6 caracteres"
                                secureTextEntry
                                className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                            />
                        </View>

                        <View className="mt-4">
                            <Text className="font-medium text-gray-700 mb-2">Confirmar contraseña</Text>
                            <TextInput
                                value={confirmPass}
                                onChangeText={setConfirmPass}
                                placeholder="Repite la contraseña"
                                secureTextEntry
                                className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                            />
                        </View>
                    </View>

                    {/* Botón registrar */}
                    <TouchableOpacity
                        onPress={registrar}
                        disabled={loading}
                        className={`mt-4 py-4 rounded-xl flex-row items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-black'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Crear Cuenta</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link para volver al login */}
                    <TouchableOpacity onPress={onBack} className="mt-2 items-center py-2">
                        <Text className="text-gray-500">
                            ¿Ya tienes cuenta? <Text className="text-black font-bold">Inicia sesión</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
