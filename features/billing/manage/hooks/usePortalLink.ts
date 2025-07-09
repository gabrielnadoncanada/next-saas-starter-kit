'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { defaultHeaders } from '@/lib/common';
import type { ApiResponse } from 'types';

interface UsePortalLinkProps {
  teamSlug: string;
}

export function usePortalLink({ teamSlug }: UsePortalLinkProps) {
  const [loading, setLoading] = useState(false);

  const openStripePortal = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/teams/${teamSlug}/payments/create-portal-link`,
        {
          method: 'POST',
          headers: defaultHeaders,
          credentials: 'same-origin',
        }
      );

      const result = (await response.json()) as ApiResponse<{ url: string }>;

      if (!response.ok) {
        toast.error(result.error.message);
        return;
      }

      setLoading(false);
      window.open(result.data.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setLoading(false);
      toast.error('Failed to open billing portal');
    }
  };

  return {
    loading,
    openStripePortal,
  };
}
