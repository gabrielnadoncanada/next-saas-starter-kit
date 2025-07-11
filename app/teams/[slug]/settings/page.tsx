import { notFound } from 'next/navigation';
import { AccessControl } from '@/components/shared/AccessControl';
import { TeamTab, EditTeam, DeleteTeam } from '@/features/team';
import { getTeamBySlug } from '@/lib/data-fetchers';
import env from '@/lib/env';
import type { TeamFeature } from 'types';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Settings(props: Props) {
  const params = await props.params;
  const team = await getTeamBySlug(params.slug);

  if (!team) {
    notFound();
  }

  const teamFeatures: TeamFeature = env.teamFeatures;

  return (
    <>
      <TeamTab activeTab="settings" team={team} teamFeatures={teamFeatures} />
      <div className="space-y-6">
        <EditTeam team={team} />
        <AccessControl resource="team" actions={['delete']}>
          <DeleteTeam
            teamSlug={team.slug}
            allowDelete={teamFeatures.deleteTeam}
          />
        </AccessControl>
      </div>
    </>
  );
}
