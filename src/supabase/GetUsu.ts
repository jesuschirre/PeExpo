import { Session } from "@supabase/supabase-js";
import { userType } from "@/types";
import { supabase } from "./supabase";

export const GetSession = async (): Promise<{ data: Session | null; error: string | null }> => {
	try {
		const { data, error } = await supabase.auth.getSession();

		if (error) {
			console.error("🔴 Error obteniendo sesión:", error.message);
			return { data: null, error: error.message };
		}

		return { data: data.session, error: null };
	} catch (error: any) {
		console.error("🔴 Excepción obteniendo sesión:", error);
		return { data: null, error: error.message || "Error inesperado al obtener la sesión." };
	}
};

export const GetUserByAuthId = async (
	authId: string
): Promise<{ data: userType | null; error: string | null }> => {
	try {
		const { data, error } = await supabase
			.from("usuario")
			.select("*")
			.eq("id_auth", authId)
			.single();

		if (error) {
			console.error("🔴 Error obteniendo usuario:", error.message);
			return { data: null, error: error.message };
		}

		return { data: data as userType, error: null };
	} catch (error: any) {
		console.error("🔴 Excepción obteniendo usuario:", error);
		return { data: null, error: error.message || "Error inesperado al obtener el usuario." };
	}
};
