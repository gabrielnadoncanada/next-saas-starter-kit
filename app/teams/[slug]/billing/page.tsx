'use client';

import useSWR from 'swr';
import { redirect } from 'next/navigation';

import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import fetcher from '@/lib/fetcher';
import useCanAccess from 'hooks/useCanAccess';
import { TeamTab } from '@/components/team';
import Help from '@/components/billing/Help';
import { Error, Loading } from '@/components/shared';
import LinkToPortal from '@/components/billing/LinkToPortal';
import Subscriptions from '@/components/billing/Subscriptions';
import ProductPricing from '@/components/billing/ProductPricing';
import type { TeamFeature } from 'types';

export default function Payments() {
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();
  const teamFeatures: TeamFeature = env.teamFeatures;

  const { data } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/payments/products` : null,
    fetcher
  );

  // Redirect if payments feature is not enabled
  if (!env.teamFeatures.payments) {
    redirect('/404');
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message="Team not found" />;
  }

  const plans = data?.data?.products || [];
  const subscriptions = data?.data?.subscriptions || [];

  return (
    <>
      {canAccess('team_payments', ['read']) && (
        <>
          <TeamTab
            activeTab="payments"
            team={team}
            teamFeatures={teamFeatures}
          />

          <div className="flex gap-6 flex-col md:flex-row">
            <LinkToPortal team={team} />
            <Help />
          </div>

          <div className="py-6">
            <Subscriptions subscriptions={subscriptions} />
          </div>

          <ProductPricing plans={plans} subscriptions={subscriptions} />
        </>
      )}
    </>
  );
}
