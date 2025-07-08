import toast from 'react-hot-toast';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

import type { ApiResponse } from 'types';
import { defaultHeaders } from '@/lib/common';
import { Invitation, Team } from '@prisma/client';

interface AcceptInvitationProps {
  invitation: Invitation & { team: Team };
}

const AcceptInvitation = ({ invitation }: AcceptInvitationProps) => {
  const router = useRouter();
  const t = useTranslations();

  const acceptInvitation = async () => {
    const response = await fetch(
      `/api/teams/${invitation.team.slug}/invitations`,
      {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ inviteToken: invitation.token }),
      }
    );

    if (!response.ok) {
      const result = (await response.json()) as ApiResponse;
      toast.error(result.error.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <>
      <h3 className="text-center">{t('accept-invite')}</h3>
      <Button onClick={acceptInvitation} fullWidth color="primary" size="md">
        {t('accept-invitation')}
      </Button>
    </>
  );
};

export default AcceptInvitation;
