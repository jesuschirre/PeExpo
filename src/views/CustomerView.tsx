import React from 'react';
import { Product, Order, View as AppViewType } from '../types';
import { CustomerMenu } from './CustomerMenu';
import { CustomerTracking } from './CustomerTracking';

interface CustomerViewProps {
  view: AppViewType;
  products: Product[];
  activeOrder: Order | undefined;
  onCreateOrder: (order: Order) => void;
  onNavigateTracking: () => void;
}

export function CustomerView({ view, products, activeOrder, onCreateOrder, onNavigateTracking }: CustomerViewProps) {
  if (view === 'tracking') {
    return <CustomerTracking order={activeOrder} />;
  }

  return (
    <CustomerMenu
      products={products}
      onCreateOrder={(order) => {
        onCreateOrder(order);
        onNavigateTracking();
      }}
      hasActiveOrder={!!activeOrder && activeOrder.status !== 'delivered'}
    />
  );
}