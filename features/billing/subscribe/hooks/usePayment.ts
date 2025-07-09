'use client';

import { toast } from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import useTeam from 'hooks/useTeam';

export function usePayment() {
  const { team } = useTeam();
  const t = useTranslations();

  const initiateCheckout = async (price: string, quantity?: number) => {
    if (!team) {
      toast.error('Team not found');
      return;
    }

    try {
      const res = await fetch(
        `/api/teams/${team.slug}/payments/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ price, quantity }),
        }
      );

      const data = await res.json();

      if (data?.data?.url) {
        window.open(data.data.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(
          data?.error?.message ||
            data?.error?.raw?.message ||
            t('stripe-checkout-fallback-error')
        );
      }
    } catch (error) {
      toast.error(t('stripe-checkout-fallback-error'));
    }
  };

  return {
    initiateCheckout,
  };
}
