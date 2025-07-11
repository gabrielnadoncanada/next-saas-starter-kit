import {
  deleteVerificationToken,
  getVerificationToken,
  isVerificationTokenExpired,
} from '@/features/auth/shared/model/verificationToken';
import { unlockAccount } from '@/lib/accountLock';
import { getUser } from '@/shared/model/user';
import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/layouts';
import UnlockAccountClient from './UnlockAccountClient';

interface UnlockAccountProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function UnlockAccount(props: UnlockAccountProps) {
  const searchParams = await props.searchParams;
  const { token } = searchParams;

  if (!token) {
    redirect('/not-found');
  }

  const verificationToken = await getVerificationToken(token);

  if (!verificationToken) {
    return (
      <AuthLayout heading="Unlock Account">
        <UnlockAccountClient
          error="The link is invalid or has already been used. Please contact support if you need further assistance."
          enableRequestNewToken={false}
          email={null}
          expiredToken={null}
        />
      </AuthLayout>
    );
  }

  const user = await getUser({ email: verificationToken.identifier });

  if (!user) {
    redirect('/not-found');
  }

  if (isVerificationTokenExpired(verificationToken)) {
    return (
      <AuthLayout heading="Unlock Account">
        <UnlockAccountClient
          error="The link has expired. Please request a new one if you still need to unlock your account."
          enableRequestNewToken={true}
          email={verificationToken.identifier}
          expiredToken={verificationToken.token}
        />
      </AuthLayout>
    );
  }

  await Promise.allSettled([
    unlockAccount(user),
    deleteVerificationToken(verificationToken.token),
  ]);

  redirect('/auth/login?success=account-unlocked');
}
