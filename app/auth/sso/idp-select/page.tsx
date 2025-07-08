import { AuthLayout } from '@/components/layouts';
import { LetterAvatar } from '@/components/shared';
import jackson from '@/lib/jackson';
import { SAMLSSORecord } from '@boxyhq/saml-jackson';
import { redirect } from 'next/navigation';
import IdPSelectionClient from './IdPSelectionClient';

interface IdPSelectionProps {
  searchParams: Promise<{
    authFlow?: string;
    tenant?: string;
    product?: string;
    idp_hint?: string;
    entityId?: string;
    [key: string]: string | undefined;
  }>;
}

export default async function IdPSelection(props: IdPSelectionProps) {
  const searchParams = await props.searchParams;
  const { apiController } = await jackson();

  const { authFlow = 'sp-initiated', tenant, product, idp_hint } = searchParams;

  if (!tenant || !product) {
    redirect('/auth/sso');
  }

  // The user has selected an IdP to continue with
  if (idp_hint) {
    const params = new URLSearchParams(
      searchParams as Record<string, string>
    ).toString();

    const destinations = {
      'sp-initiated': `/api/oauth/authorize?${params}`,
    };

    redirect(destinations[authFlow as keyof typeof destinations]);
  }

  // No IdP selected, fetch the list of IdPs
  const connections = await apiController.getConnections({
    tenant,
    product,
  });

  // Transform the connections into a format that we can use
  // Send only the clientID and name to the frontend
  const connectionsFormatted = connections.map((connection) => {
    const idpMetadata =
      'idpMetadata' in connection ? connection.idpMetadata : undefined;
    const oidcProvider =
      'oidcProvider' in connection ? connection.oidcProvider : undefined;

    const name =
      connection.name ||
      (idpMetadata
        ? idpMetadata.friendlyProviderName || idpMetadata.provider
        : oidcProvider?.friendlyProviderName || oidcProvider?.provider) ||
      'Unknown Provider';

    return {
      clientID: connection.clientID,
      name,
    };
  });

  return (
    <AuthLayout
      heading="SSO Login"
      description="Select your identity provider to continue"
    >
      <IdPSelectionClient
        connections={connectionsFormatted}
        searchParams={searchParams}
      />
    </AuthLayout>
  );
}
