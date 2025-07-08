'use client';

import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import useTeam from 'hooks/useTeam';
import { toast } from 'react-hot-toast';
import { redirect } from 'next/navigation';
import env from '@/lib/env';
import { DirectoriesWrapper } from '@boxyhq/react-ui/dsync';
import { BOXYHQ_UI_CSS } from '@/components/styles';
import type { TeamFeature } from 'types';

export default function DirectorySync() {
  const { isLoading, isError, team } = useTeam();
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if directory sync feature is not enabled
  if (!env.teamFeatures.dsync) {
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
      <TeamTab
        activeTab="directory-sync"
        team={team}
        teamFeatures={teamFeatures}
      />
      <DirectoriesWrapper
        classNames={BOXYHQ_UI_CSS}
        componentProps={{
          directoryList: {
            cols: ['name', 'type', 'status', 'actions'],
            hideViewAction: true,
          },
          createDirectory: {
            excludeFields: [
              'product',
              'tenant',
              'webhook_secret',
              'webhook_url',
              'log_webhook_events',
            ],
            disableGoogleProvider: true,
          },
          editDirectory: {
            excludeFields: [
              'webhook_url',
              'webhook_secret',
              'log_webhook_events',
            ],
          },
        }}
        urls={{
          get: `/api/teams/${team.slug}/dsync`,
          post: `/api/teams/${team.slug}/dsync`,
          patch: `/api/teams/${team.slug}/dsync`,
          delete: `/api/teams/${team.slug}/dsync`,
        }}
        successCallback={({ operation }) => {
          if (operation === 'CREATE') {
            toast.success(`Connection created successfully.`);
          } else if (operation === 'UPDATE') {
            toast.success(`Connection updated successfully.`);
          } else if (operation === 'DELETE') {
            toast.success(`Connection deleted successfully.`);
          } else if (operation === 'COPY') {
            toast.success(`Contents copied to clipboard`);
          }
        }}
        errorCallback={(errMessage) => toast.error(errMessage)}
      />
    </>
  );
}
