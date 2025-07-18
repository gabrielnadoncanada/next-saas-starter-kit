import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';

import { Invitation } from '@prisma/client';
import { useCustomSignOut } from 'hooks/useCustomSignout';

interface EmailDomainMismatchProps {
  invitation: Invitation;
  emailDomain: string;
}

const EmailDomainMismatch = ({
  invitation,
  emailDomain,
}: EmailDomainMismatchProps) => {
  const t = useTranslations();
  const { allowedDomains } = invitation;
  const signOut = useCustomSignOut();

  const allowedDomainsString =
    allowedDomains.length === 1
      ? `the domain: ${allowedDomains[0]}`
      : `one of the following domains: ${allowedDomains.join(', ')}`;

  return (
    <>
      <p className="text-sm text-center">
        {t('email-domain-not-allowed', { emailDomain, allowedDomainsString })}
      </p>
      <p className="text-sm text-center">
        {t('accept-invitation-email-domain-instruction')}
      </p>
      <Button variant="outline" onClick={signOut} className="w-full">
        {t('logout')}
      </Button>
    </>
  );
};

export default EmailDomainMismatch;
