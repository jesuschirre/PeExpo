import { supabase } from "./supabase";

// Loguin del usuario 
export const signInWithEmail = async (email: string, pass: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (error) {
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error("Error signing in with email:", error);
        return { data: null, error: error.message || 'Ocurrió un error inesperado al iniciar sesión.' };
    }
}

// registro del usuario 
export const RegisterUser = async (
    email: string,
    pass: string,
    nombre: string,
    apellido: string,
    telefono: string,
) => {
    try {
        // Registrar en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: pass
        });

        if (authError) {
            console.error("🔴 Error en signUp:", authError.message);
            return { data: null, error: authError.message };
        }

        const userId = authData.user?.id;
        if (!userId) {
            console.error("🔴 No se obtuvo el ID del usuario.");
            return { data: null, error: "No se pudo obtener el ID del usuario registrado." };
        }

        // Crear el usuario en la tabla usuario
        const { data: usuario, error: errorUsuario } = await supabase
            .from("usuario")
            .insert([{
                nombre: nombre,
                apellido: apellido,
                id_auth: userId,
                telefono: telefono,
            }])
            .select()
            .single();

        if (errorUsuario) {
            console.error("🔴 Error creando usuario:", errorUsuario.message);
            return { data: null, error: "Error al crear el perfil: " + errorUsuario.message };
        }


        console.log("✅ Registro completo:", { authData, usuario });
        return {
            data: { auth: authData, usuario },
            error: null
        };

    } catch (error: any) {
        console.error("🔴 Excepción inesperada en RegisterUser:", error);
        return { data: null, error: error.message || "Ocurrió un error inesperado durante el registro." };
    }
}