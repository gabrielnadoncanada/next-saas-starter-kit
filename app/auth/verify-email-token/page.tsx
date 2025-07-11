import { updateUser } from '@/shared/model/user';
import {
  deleteVerificationToken,
  getVerificationToken,
} from '@/features/auth/shared/model/verificationToken';
import { redirect } from 'next/navigation';

interface VerifyEmailTokenProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function VerifyEmailToken(props: VerifyEmailTokenProps) {
  const searchParams = await props.searchParams;
  const { token } = searchParams;

  if (!token) {
    redirect('/not-found');
  }

  const verificationToken = await getVerificationToken(token);

  if (!verificationToken) {
    redirect('/auth/login?error=token-not-found');
  }

  if (new Date() > verificationToken.expires) {
    redirect('/auth/resend-email-token?error=verify-account-expired');
  }

  await Promise.allSettled([
    updateUser({
      where: {
        email: verificationToken.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    }),

    deleteVerificationToken(verificationToken.token),
  ]);

  redirect('/auth/login?success=email-verified');
}
