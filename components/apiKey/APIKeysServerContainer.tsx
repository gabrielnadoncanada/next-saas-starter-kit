import { TeamTab } from '@/features/team';
import { useTranslations } from 'next-intl';
import APIKeysClient from './APIKeysClient';
import { TeamFeature } from 'types';

interface APIKeysServerContainerProps {
  team: any;
  apiKeys: any[];
  teamFeatures: TeamFeature;
}

const APIKeysServerContainer = ({
  team,
  apiKeys,
  teamFeatures,
}: APIKeysServerContainerProps) => {
  return (
    <>
      <TeamTab activeTab="api-keys" team={team} teamFeatures={teamFeatures} />
      <APIKeysClient team={team} apiKeys={apiKeys} />
    </>
  );
};

export default APIKeysServerContainer;
