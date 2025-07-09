import { TeamTab } from '@/features/team';
import { ApiKeysList } from './list/ApiKeysList';
import { TeamFeature } from 'types';

interface ApiKeysServerContainerProps {
  team: any;
  apiKeys: any[];
  teamFeatures: TeamFeature;
}

export function ApiKeysServerContainer({
  team,
  apiKeys,
  teamFeatures,
}: ApiKeysServerContainerProps) {
  return (
    <>
      <TeamTab activeTab="api-keys" team={team} teamFeatures={teamFeatures} />
      <ApiKeysList teamSlug={team.slug} apiKeys={apiKeys} />
    </>
  );
}
