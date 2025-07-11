'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createPortalLinkAction } from '../actions/createPortalLink.action';

interface UsePortalLinkProps {
  teamSlug: string;
}

export function usePortalLink({ teamSlug }: UsePortalLinkProps) {
  const [loading, setLoading] = useState(false);

  const openStripePortal = async () => {
    setLoading(true);

    try {
      const result = await createPortalLinkAction(teamSlug);

      if (result.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      if (result.data?.url) {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Failed to open billing portal');
      }

      setLoading(false);
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
