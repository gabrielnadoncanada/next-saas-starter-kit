'use client';

import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import useTeam from 'hooks/useTeam';
import { createCheckoutSessionAction } from '../actions/createCheckoutSession.action';

export function usePayment() {
  const { team } = useTeam();
  const t = useTranslations();

  const initiateCheckout = async (price: string, quantity?: number) => {
    if (!team) {
      toast.error('Team not found');
      return;
    }

    try {
      const result = await createCheckoutSessionAction(
        team.slug,
        price,
        quantity
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data?.url) {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(t('stripe-checkout-fallback-error'));
      }
    } catch (error) {
      toast.error(t('stripe-checkout-fallback-error'));
    }
  };

  return {
    initiateCheckout,
  };
}
