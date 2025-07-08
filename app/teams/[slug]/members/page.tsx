'use client';

import { PendingInvitations } from '@/components/invitation';
import { Error, Loading } from '@/components/shared';
import { Members, TeamTab } from '@/components/team';
import env from '@/lib/env';
import useTeam from 'hooks/useTeam';
import type { TeamFeature } from 'types';

export default function TeamMembers() {
  const { isLoading, isError, team } = useTeam();
  const teamFeatures: TeamFeature = env.teamFeatures;

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
      <TeamTab activeTab="members" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <Members team={team} />
        <PendingInvitations team={team} />
      </div>
    </>
  );
}
