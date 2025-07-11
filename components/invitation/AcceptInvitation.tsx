import toast from 'react-hot-toast';
import { Button } from '@/lib/components/ui/button';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { Invitation, Team } from '@prisma/client';

interface AcceptInvitationProps {
  invitation: Invitation & { team: Team };
}

const AcceptInvitation = ({ invitation }: AcceptInvitationProps) => {
  const router = useRouter();
  const t = useTranslations();

  const acceptInvitation = async () => {
    // This component is for existing users accepting invitations
    // It would need a different server action or the invitation acceptance
    // logic needs to be updated to handle existing users
    toast.error('This feature needs to be updated to work with server actions');
  };

  return (
    <>
      <h3 className="text-center">{t('accept-invite')}</h3>
      <Button onClick={acceptInvitation} className="w-full">
        {t('accept-invitation')}
      </Button>
    </>
  );
};

export default AcceptInvitation;
