import { View as AppViewType, Order, Product } from '../types';
import { CustomerMenu } from './CustomerMenu';
import { CustomerTracking } from './CustomerTracking';

interface CustomerViewProps {
  view: AppViewType;
  products: Product[];
  orders: Order[];
  onCreateOrder: (order: Order) => void;
  onNavigateTracking: () => void;
}

export function CustomerView({ view, products, orders, onCreateOrder, onNavigateTracking }: CustomerViewProps) {
    if (view === 'tracking') {
      return <CustomerTracking orders={orders} />;
  }

  return (
    <CustomerMenu
      products={products}
      onCreateOrder={(order) => {
        onCreateOrder(order);
        onNavigateTracking();
      }}
      hasActiveOrder={orders.some(order => !['delivered', 'cancelled'].includes(order.status))}
    />
  );
}