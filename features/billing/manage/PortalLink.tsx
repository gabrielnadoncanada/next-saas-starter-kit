'use client';

import { usePortalLink } from './hooks/usePortalLink';
import { PortalLinkView } from './ui/PortalLinkView';

interface PortalLinkProps {
  teamSlug: string;
}

export function PortalLink({ teamSlug }: PortalLinkProps) {
  const { loading, openStripePortal } = usePortalLink({ teamSlug });

  return <PortalLinkView loading={loading} onOpenPortal={openStripePortal} />;
}
