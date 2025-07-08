'use client';

import { Card } from '@/components/shared';
import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import useCanAccess from 'hooks/useCanAccess';
import useTeam from 'hooks/useTeam';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { TeamFeature } from 'types';

interface RetracedEventsBrowserProps {
  host: string;
  auditLogToken: string;
  header: string;
}

const RetracedEventsBrowser = dynamic<RetracedEventsBrowserProps>(
  () => import('@retracedhq/logs-viewer'),
  {
    ssr: false,
  }
);

export default function Events() {
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();
  const { data: session } = useSession();
  const [auditLogToken, setAuditLogToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const teamFeatures: TeamFeature = env.teamFeatures;

  // Redirect if audit log feature is not enabled
  if (!env.teamFeatures.auditLog) {
    redirect('/404');
  }

  useEffect(() => {
    const fetchAuditLogToken = async () => {
      if (!team || !session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/teams/${team.slug}/audit-logs/token`
        );
        if (response.ok) {
          const data = await response.json();
          setAuditLogToken(data.token || '');
        } else {
          const errorData = await response.json();
          setError(
            errorData.error?.message || 'Failed to fetch audit log token'
          );
        }
      } catch (err) {
        setError('Failed to fetch audit log token');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogToken();
  }, [team, session]);

  if (isLoading || loading) {
    return <Loading />;
  }

  if (isError || error) {
    return <Error message={isError?.message || error} />;
  }

  if (!team) {
    return <Error message="Team not found" />;
  }

  return (
    <>
      <TeamTab activeTab="audit-logs" team={team} teamFeatures={teamFeatures} />
      <Card>
        <Card.Body>
          {canAccess('team_audit_log', ['read']) && auditLogToken && (
            <RetracedEventsBrowser
              host={`${env.retraced.url}/viewer/v1`}
              auditLogToken={auditLogToken}
              header="Audit Logs"
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
}
