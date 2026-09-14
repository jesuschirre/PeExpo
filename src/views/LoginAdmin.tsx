import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signInWithEmail } from '../supabase/auth';

// interface para el admin
interface LoginAdminProps {
    onLoginSuccess: () => void;
    onBack: () => void;
    onGoToRegister: () => void;
}

export function LoginAdmin({ onLoginSuccess, onBack, onGoToRegister }: LoginAdminProps) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [userError, setUserError] = useState<string | null>(null);
    const router = useRouter();

    // Funcion para Logearse
    async function iniciar() {
        setUserError(null);
        if (!email.trim() || !pass.trim()) {
            setUserError("Por favor, ingresa tu correo y contraseña.");
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await signInWithEmail(email, pass);
            
            if (error) {
                console.error("Error en autenticación (Supabase):", error);
                
                const errorMessage = error.message || "";                
                if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("invalid claim")) {
                    setUserError("Credenciales incorrectas. Verifica tu correo o contraseña e intenta de nuevo.");
                } else {
                    setUserError("Ocurrió un problema al iniciar sesión. Por favor, inténtalo más tarde.");
                }
            } else if (data) {
                console.log("Sesión iniciada correctamente:", data);
                onLoginSuccess();
            }
        } catch (err: any) {
            console.error("Excepción inesperada en LoginAdmin:", err);
            
            setUserError("Error de conexión. Verifica tu internet y vuelve a intentar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 pb-20 relative">
            <View className="pt-16 px-6 pb-6 bg-white shadow-sm rounded-b-3xl mb-6">
                <Text className="text-3xl font-bold text-gray-900">Admin Login</Text>
                <Text className="text-gray-500 mt-1">Ingresa para administrar los pedidos e inventario</Text>
            </View>

            <View className="px-6 flex-1 mt-10">
                <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
                    
                    {/* Alerta de error para el usuario */}
                    {userError && (
                        <View className="bg-red-50 p-4 rounded-2xl border border-red-200">
                            <Text className="text-red-700 font-medium text-sm text-center">
                                {userError}
                            </Text>
                        </View>
                    )}
                    {/*imput para el correo*/}
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
                    {/*imput para la contraseña*/}
                    <View>
                        <Text className="font-medium text-gray-700 mb-2">Contraseña</Text>
                        <TextInput 
                            value={pass}
                            onChangeText={setPass}
                            placeholder="********"
                            secureTextEntry
                            className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800"
                        />
                    </View>
                    {/*Boton para para iniciar la funcion*/}
                    <TouchableOpacity 
                        onPress={iniciar}
                        disabled={loading}
                        className={`mt-4 py-4 rounded-xl flex-row items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-black'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Ingresar</Text>
                        )}
                    </TouchableOpacity>

                    {/* Link para ir a registro */}
                    <TouchableOpacity onPress={onGoToRegister} className="mt-2 items-center py-2">
                        <Text className="text-gray-500">
                            ¿No tienes cuenta? <Text className="text-black font-bold">Regístrate</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}