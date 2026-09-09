export type Category = 'Burgers' | 'Coffee' | 'Desserts' | 'Drinks';

export const CATEGORIES: Category[] = ['Burgers', 'Coffee', 'Desserts', 'Drinks'];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  imageUrl?: string;
  description?: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'classic-burger',
    name: 'Classic Burger',
    category: 'Burgers',
    price: 8.5,
    description: 'Beef patty, lettuce, tomato, and house sauce.',
  },
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    category: 'Coffee',
    price: 3.5,
    description: 'Cold brew coffee served over ice.',
  },
  {
    id: 'chocolate-cake',
    name: 'Chocolate Cake',
    category: 'Desserts',
    price: 4.25,
    description: 'Rich chocolate cake with a soft center.',
  },
  {
    id: 'fresh-lemonade',
    name: 'Fresh Lemonade',
    category: 'Drinks',
    price: 2.75,
    description: 'Freshly squeezed lemonade.',
  },
];

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