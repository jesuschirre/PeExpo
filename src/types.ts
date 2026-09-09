export type Category = 'Burgers' | 'Coffee' | 'Desserts' | 'Drinks';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  imageUrl?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
}

export type Role = 'customer' | 'admin' | null;

export type View = 'menu' | 'tracking' | 'admin_products' | 'admin_orders';