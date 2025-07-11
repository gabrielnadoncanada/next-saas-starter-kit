import { PendingInvitations } from '@/features/invitation';
import { Error } from '@/components/shared';
import { TeamTab } from '@/features/team/shared/ui/TeamTab';
import { MembersClient } from '@/features/member';
import env from '@/lib/env';
import { getTeamWithMembers } from '@/lib/data-fetchers';
import type { TeamFeature } from 'types';

interface TeamMembersProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamMembers(props: TeamMembersProps) {
  const params = await props.params;
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
