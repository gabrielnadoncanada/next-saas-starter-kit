import { redirect } from 'next/navigation';
import env from '@/lib/env';
import { getTeamWithBilling } from '@/lib/data-fetchers';
import { BillingServerContainer } from '@/features/billing';
import type { TeamFeature } from 'types';

interface PaymentsProps {
  params: { slug: string };
}

export default async function Payments({ params }: PaymentsProps) {
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if payments feature is not enabled
  if (!env.teamFeatures.payments) {
    redirect('/404');
  }

  try {
    const { team, products, subscriptions } = await getTeamWithBilling(
      params.slug
    );

    return (
      <BillingServerContainer
        team={team}
        products={products}
        subscriptions={subscriptions}
        teamFeatures={teamFeatures}
      />
    );
  } catch (error) {
    redirect('/teams');
  }
}
