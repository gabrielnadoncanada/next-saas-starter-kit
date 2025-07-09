import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';
import { useCustomSignOut } from 'hooks/useCustomSignout';

interface EmailMismatchProps {
  email: string;
}

const EmailMismatch = ({ email }: EmailMismatchProps) => {
  const t = useTranslations();
  const signOut = useCustomSignOut();

  return (
    <>
      <p className="text-sm text-center">
        {t('email-mismatch-error', { email })}
      </p>
      <p className="text-sm text-center">
        {t('accept-invitation-email-instruction')}
      </p>
      <Button variant="outline" onClick={signOut} className="w-full">
        {t('logout')}
      </Button>
    </>
  );
};

export default EmailMismatch;
