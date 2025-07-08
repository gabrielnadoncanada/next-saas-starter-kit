'use client';

import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { ConnectionsWrapper } from '@boxyhq/react-ui/sso';
import useTeam from 'hooks/useTeam';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';
import env from '@/lib/env';
import { BOXYHQ_UI_CSS } from '@/components/styles';
import type { TeamFeature } from 'types';

export default function TeamSSO() {
  const { isLoading, isError, team } = useTeam();
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if SSO feature is not enabled
  if (!env.teamFeatures.sso) {
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

  const SPConfigURL = env.jackson.selfHosted
    ? `${env.jackson.externalUrl}/.well-known/saml-configuration`
    : '/well-known/saml-configuration';

  return (
    <>
      <TeamTab activeTab="sso" team={team} teamFeatures={teamFeatures} />
      <ConnectionsWrapper
        urls={{
          spMetadata: SPConfigURL,
          get: `/api/teams/${team.slug}/sso`,
          post: `/api/teams/${team.slug}/sso`,
          patch: `/api/teams/${team.slug}/sso`,
          delete: `/api/teams/${team.slug}/sso`,
        }}
        successCallback={({
          operation,
          connectionIsSAML,
          connectionIsOIDC,
        }) => {
          const ssoType = connectionIsSAML
            ? 'SAML'
            : connectionIsOIDC
              ? 'OIDC'
              : '';
          if (operation === 'CREATE') {
            toast.success(`${ssoType} connection created successfully.`);
          } else if (operation === 'UPDATE') {
            toast.success(`${ssoType} connection updated successfully.`);
          } else if (operation === 'DELETE') {
            toast.success(`${ssoType} connection deleted successfully.`);
          } else if (operation === 'COPY') {
            toast.success(`Contents copied to clipboard`);
          }
        }}
        errorCallback={(errMessage) => toast.error(errMessage)}
        classNames={BOXYHQ_UI_CSS}
        componentProps={{
          connectionList: {
            cols: ['provider', 'type', 'status', 'actions'],
          },
          editOIDCConnection: { displayInfo: false },
          editSAMLConnection: { displayInfo: false },
        }}
      />
    </>
  );
}
