'use client';

import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { Webhooks } from '@/components/webhook';
import useTeam from 'hooks/useTeam';
import { redirect } from 'next/navigation';
import env from '@/lib/env';
import type { TeamFeature } from 'types';

export default function WebhookList() {
  const { isLoading, isError, team } = useTeam();
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if webhook feature is not enabled
  if (!env.teamFeatures.webhook) {
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

  return (
    <>
      <TeamTab activeTab="webhooks" team={team} teamFeatures={teamFeatures} />
      <Webhooks team={team} />
    </>
  );
}
