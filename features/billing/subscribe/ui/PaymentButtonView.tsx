import { Button } from '@/lib/components/ui/button';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Price, Prisma, Service } from '@prisma/client';

interface PaymentButtonViewProps {
  plan: Service;
  price: Price;
  onInitiateCheckout: (priceId: string, quantity?: number) => void;
}

export function PaymentButtonView({
  plan,
  price,
  onInitiateCheckout,
}: PaymentButtonViewProps) {
  const metadata = price.metadata as Prisma.JsonObject;
  const currencySymbol = getSymbolFromCurrency(price.currency || 'USD');
  let buttonText = 'Get Started';

  if (metadata?.interval === 'month') {
    buttonText = price.amount
      ? `${currencySymbol}${price.amount} / month`
      : `Monthly`;
  } else if (metadata?.interval === 'year') {
    buttonText = price.amount
      ? `${currencySymbol}${price.amount} / year`
      : `Yearly`;
  }

  const handleClick = () => {
    onInitiateCheckout(
      price.id,
      (price.billingScheme == 'per_unit' || price.billingScheme == 'tiered') &&
        metadata.usage_type !== 'metered'
        ? 1
        : undefined
    );
  };

  return (
    <Button
      key={`${plan.id}-${price.id}`}
      variant="outline"
      onClick={handleClick}
      className="rounded-full w-full"
    >
      {buttonText}
    </Button>
  );
}
