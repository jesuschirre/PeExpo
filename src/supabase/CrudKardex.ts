import { KardexConNombre, kardexType } from "@/types";
import { supabase } from "./supabase";

type KardexInsert = Omit<kardexType, "id">;
type KardexUpdate = Partial<Omit<kardexType, "id">>;

export const GetKardex = async () => {
    try {
        const { data, error } = await supabase
            .from("kardex")
            .select(`
                id,
                id_producto (
                    nombre 
                ),
                cantidad,
                estado,
                nombreCli,
                total,
                date
            `)
            .order('id', { ascending: false });
            

        if (error) {
            console.error("🔴 Error obteniendo kardex:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data as unknown as KardexConNombre[], error: null };    
    } 
    catch (error: any) {
        console.error("🔴 Excepción en GetKardex:", error);
        return { data: null, error: error.message || "Error inesperado al obtener el kardex." };
    }
};

export const InsertKardex = async (kardex: KardexInsert[]) => {
    try {
        const { data, error } = await supabase
            .from("kardex")
            .insert(kardex)
            .select();

        if (error) {
            console.error("🔴 Error insertando movimientos en kardex:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data as kardexType[], error: null };
    } catch (error: any) {
        console.error("🔴 Excepción insertando movimiento en kardex:", error);
        return { data: null, error: error.message || "Error inesperado al crear el movimiento del kardex." };
    }
};

export const UpdateKardex = async (kardexId: number, updates: KardexUpdate) => {
    try {
        const { data, error } = await supabase
            .from("kardex")
            .update(updates)
            .eq("id", kardexId)
            .select()
            .single();

        if (error) {
            console.error("🔴 Error actualizando movimiento del kardex:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data as kardexType, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción actualizando movimiento del kardex:", error);
        return { data: null, error: error.message || "Error inesperado al actualizar el movimiento del kardex." };
    }
};

export const DeleteKardex = async (kardexId: number) => {
    try {
        const { error } = await supabase
            .from("kardex")
            .delete()
            .eq("id", kardexId);

        if (error) {
            console.error("🔴 Error eliminando movimiento del kardex:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción eliminando movimiento del kardex:", error);
        return { success: false, error: error.message || "Error inesperado al eliminar el movimiento del kardex." };
    }
};