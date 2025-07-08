'use client';

import { useSession } from 'next-auth/react';
import useInvitation from 'hooks/useInvitation';
import { Error, Loading } from '@/components/shared';
import { extractEmailDomain } from '@/lib/email/utils';
import EmailMismatch from '@/components/invitation/EmailMismatch';
import AcceptInvitation from '@/components/invitation/AcceptInvitation';
import NotAuthenticated from '@/components/invitation/NotAuthenticated';
import EmailDomainMismatch from '@/components/invitation/EmailDomainMismatch';

export default function AcceptTeamInvitation() {
  const { status, data } = useSession();
  const { isLoading, error, invitation } = useInvitation();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error?.message || 'Invitation not found'} />;
  }

  const authUser = data?.user;

  const emailDomain = authUser?.email
    ? extractEmailDomain(authUser.email)
    : null;

  const emailMatch = invitation.email
    ? authUser?.email === invitation.email
    : false;

  const emailDomainMatch = invitation.allowedDomains.length
    ? invitation.allowedDomains.includes(emailDomain!)
    : true;

  const acceptInvite = invitation.sentViaEmail ? emailMatch : emailDomainMatch;

  return (
    <div className="rounded p-6 border">
      <div className="flex flex-col items-center space-y-6">
        <h2 className="font-bold">
          {`${invitation.team.name} Team Invitation`}
        </h2>

        {/* User not authenticated */}
        {status === 'unauthenticated' && (
          <NotAuthenticated invitation={invitation} />
        )}

        {/* User authenticated and email matches */}
        {status === 'authenticated' && acceptInvite && (
          <AcceptInvitation invitation={invitation} />
        )}

        {/* User authenticated and email does not match */}
        {status === 'authenticated' &&
          invitation.sentViaEmail &&
          authUser?.email &&
          !emailMatch && <EmailMismatch email={authUser.email} />}

        {/* User authenticated and email domain doesn not match */}
        {status === 'authenticated' &&
          !invitation.sentViaEmail &&
          invitation.allowedDomains.length > 0 &&
          !emailDomainMatch && (
            <EmailDomainMismatch
              invitation={invitation}
              emailDomain={emailDomain!}
            />
          )}
      </div>
    </div>
  );
}
