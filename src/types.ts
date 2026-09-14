export interface Product {
  id: number;
  nombre: string;
  id_categoria: number;
  precio_venta: number;
  stock_actual: number;
  estado:boolean;
  img?: string;}
export interface userType {
  id: number;
  nombre: string;
  apellido:string;
  id_auth: string;
  telefono: string;
}
export interface CategoryType {
  id: number;
  nombre:string;
  descripcion:string;
  estado:boolean;
}
export interface kardexType {
  id: number;  
  id_producto: number;
  cantidad: number;
  estado: string;
  nombreCli: string;
  total: number;
}
export interface KardexConNombre {
  id: number;
  id_producto: { 
    nombre: string; 
  }; 
  cantidad: number;
  estado: string;
  nombreCli: string;
  total: number;
  date: string
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'processing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
}

export type Role = 'customer' | 'admin' | null;

export type View = 'menu' | 'tracking' | 'admin_products' | 'admin_categories' | 'admin_kardex';