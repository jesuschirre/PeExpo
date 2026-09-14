import { CategoryType } from "@/types";
import { supabase } from "./supabase";

type CategoryInsert = Omit<CategoryType, "id">;
type CategoryUpdate = Partial<Omit<CategoryType, "id">>;

export const GetCategory = async () => {
    try {
        const { data, error } = await supabase
            .from("categoria")
            .select("*")
            .order('id', { ascending: false })
                    
        if (error) {
            console.error("🔴 Error obteniendo categorias:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data as CategoryType[], error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en GetCategory:", error);
        return { data: null, error: error.message || "Error inesperado al obtener categorías." };
    }
};

export const InsertCategory = async (categoryData: CategoryInsert) => {
    try {
        const { data, error } = await supabase
            .from("categoria")
            .insert([categoryData])
            .select()
            .single();

        if (error) {
            console.error("🔴 Error insertando categoría:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data as CategoryType, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en InsertCategory:", error);
        return { data: null, error: error.message || "Error inesperado al crear la categoría." };
    }
};

export const UpdateCategory = async (categoryId: number, updates: CategoryUpdate) => {
    try {
        const { data, error } = await supabase
            .from("categoria")
            .update(updates)
            .eq("id", categoryId)
            .select()
            .single();

        if (error) {
            console.error("🔴 Error actualizando categoría:", error.message);
            return { data: null, error: error.message };
        }

        return { data: data as CategoryType, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en UpdateCategory:", error);
        return { data: null, error: error.message || "Error inesperado al actualizar la categoría." };
    }
};

export const DeleteCategory = async (categoryId: number) => {
    try {
        const { error } = await supabase
            .from("categoria")
            .delete()
            .eq("id", categoryId);

        if (error) {
            console.error("🔴 Error eliminando categoría:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en DeleteCategory:", error);
        return { success: false, error: error.message || "Error inesperado al eliminar la categoría." };
    }
};