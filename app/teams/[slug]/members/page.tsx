import { PendingInvitations } from '@/features/invitation';
import { Error } from '@/components/shared';
import { MembersClient } from '@/components/team';
import { TeamTab } from '@/features/team';
import env from '@/lib/env';
import { getTeamWithMembers } from '@/lib/data-fetchers';
import type { TeamFeature } from 'types';

interface TeamMembersProps {
  params: { slug: string };
}

export default async function TeamMembers({ params }: TeamMembersProps) {
  const teamFeatures: TeamFeature = env.teamFeatures;

  try {
    const { team, members } = await getTeamWithMembers(params.slug);

    return (
      <>
        <TeamTab activeTab="members" team={team} teamFeatures={teamFeatures} />
        <div className="space-y-6">
          <MembersClient team={team} members={members} />
          <PendingInvitations teamSlug={team.slug} />
        </div>
      </>
    );
  } catch (error) {
    return <Error message="Team not found" />;
  }
}
