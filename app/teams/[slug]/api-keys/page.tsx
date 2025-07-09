import { redirect } from 'next/navigation';
import env from '@/lib/env';
import { getTeamWithApiKeys } from '@/lib/data-fetchers';
import { ApiKeysServerContainer } from '@/features/api-key';
import type { TeamFeature } from 'types';

interface APIKeysProps {
  params: { slug: string };
}

export default async function APIKeys({ params }: APIKeysProps) {
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if API key feature is not enabled
  if (!env.teamFeatures.apiKey) {
    redirect('/404');
  }

  try {
    const { team, apiKeys } = await getTeamWithApiKeys(params.slug);

    return (
      <ApiKeysServerContainer
        team={team}
        apiKeys={apiKeys}
        teamFeatures={teamFeatures}
      />
    );
  } catch (error) {
    redirect('/teams');
  }
}
