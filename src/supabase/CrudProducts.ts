import { Product } from "@/types";
import { supabase } from "./supabase";

type ProductInsert = Omit<Product, "id">;
type ProductUpdate = Partial<Omit<Product, "id">>;

export const GetProducts = async () => {
    try {
        const { data, error } = await supabase
            .from("productos")
            .select("*")
            .order('id', { ascending: false })
        
        if (error) {
            console.error("🔴 Error obteniendo productos:", error.message);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en GetProducts:", error);
        return { data: null, error: error.message || "Error inesperado al obtener productos." };
    }
}

export const InsertProduct = async (productData: ProductInsert) => {
    try {
        const { data, error } = await supabase
            .from("productos")
            .insert([productData])
            .select()
            .single();

        if (error) {
            console.error("🔴 Error insertando producto:", error.message);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en InsertProduct:", error);
        return { data: null, error: error.message || "Error inesperado al crear el producto." };
    }
}

export const UpdateProduct = async (productId: number, updates: ProductUpdate) => {
    try {
        const { data, error } = await supabase
            .from("productos")
            .update(updates)
            .eq("id", productId)
            .select()
            .single();

        if (error) {
            console.error("🔴 Error actualizando producto:", error.message);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en UpdateProduct:", error);
        return { data: null, error: error.message || "Error inesperado al actualizar el producto." };
    }
}

export const UploadProductImage = async (uri: string, productId: number) => {
    try {
        const response = await fetch(uri);
        const file = await response.blob();
        const filePath = `products/${productId}-${Date.now()}.jpg`;

        const { error } = await supabase.storage
            .from("productos")
            .upload(filePath, file, { contentType: "image/jpeg", upsert: true });

        if (error) {
            console.error("🔴 Error subiendo imagen:", error.message);
            return { data: null, error: error.message };
        }

        const { data } = supabase.storage.from("productos").getPublicUrl(filePath);
        return { data: data.publicUrl, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción subiendo imagen:", error);
        return { data: null, error: error.message || "Error inesperado al subir la imagen." };
    }
};

export const DeleteProduct = async (productId: number) => {
    try {
        const { error } = await supabase
            .from("productos")
            .delete()
            .eq("id", productId);

        if (error) {
            console.error("🔴 Error eliminando producto:", error.message);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (error: any) {
        console.error("🔴 Excepción en DeleteProduct:", error);
        return { success: false, error: error.message || "Error inesperado al eliminar el producto." };
    }
}