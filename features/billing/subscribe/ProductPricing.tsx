'use client';

import { Service, Subscription } from '@prisma/client';
import { usePayment } from './hooks/usePayment';
import { ProductPricingView } from './ui/ProductPricingView';

interface ProductPricingProps {
  plans: any[];
  subscriptions: (Subscription & { product: Service })[];
}

export function ProductPricing({ plans, subscriptions }: ProductPricingProps) {
  const { initiateCheckout } = usePayment();

  return (
    <ProductPricingView
      plans={plans}
      subscriptions={subscriptions}
      onInitiateCheckout={initiateCheckout}
    />
  );
}
