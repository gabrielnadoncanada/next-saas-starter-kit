import { redirect } from 'next/navigation';
import env from '@/lib/env';
import { getTeamWithBilling } from '@/lib/data-fetchers';
import { BillingServerContainer } from '@/features/billing';
import type { TeamFeature } from 'types';

interface PaymentsProps {
  params: Promise<{ slug: string }>;
}

export default async function Payments(props: PaymentsProps) {
  const params = await props.params;
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
