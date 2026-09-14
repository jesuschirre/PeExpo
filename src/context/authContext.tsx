import { supabase } from "@/supabase/supabase";
import { GetSession, GetUserByAuthId } from "@/supabase/GetUsu";
import { userType } from "@/types";
import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
// Tipos del contexto
type AuthContextType = {
    user: userType | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<userType | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async (currentSession: Session | null) => {
            setSession(currentSession);

            if (!currentSession) {
                setUser(null);
                return;
            }

            const { data, error } = await GetUserByAuthId(currentSession.user.id);
            if (error) {
                setUser(null);
                return;
            }

            setUser(data);
        };

        const getInitialSession = async () => {
            try {
                const { data: session, error } = await GetSession();

                if (error) {
                    console.error("🔴 Error obteniendo sesión inicial:", error);
                    setUser(null);
                    setSession(null);
                } else {
                    await loadUser(session);
                }
            } catch (err: any) {
                console.error("🔴 Excepción obteniendo sesión inicial:", err);
                setUser(null);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listener de cambios de autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                console.log("🔵 Auth event:", event);

                if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
                    void loadUser(session).finally(() => setLoading(false));
                } else if (event === "SIGNED_OUT" || !session) {
                    setUser(null);
                    setSession(null);
                    setLoading(false);
                }
            }
        );

        // Limpiar el listener al desmontar
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Función para cerrar sesión
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error("🔴 Error cerrando sesión:", error.message);
            }
        } catch (err: any) {
            console.error("🔴 Excepción cerrando sesión:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para consumir el contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe usarse dentro de un AuthContextProvider");
    }
    return context;
}

