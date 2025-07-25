'use client';

import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, Suspense } from 'react';

import { authProviderEnabled } from '@/lib/auth-utils';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import { JoinWithInvitation, Join } from '@/features/auth';
import { Loading } from '@/components/shared';
import env from '@/lib/env';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const error = searchParams.get('error');
  const token = searchParams.get('token');

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle redirect when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('authenticated');
      router.push(env.redirectIfAuthenticated);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Loading />;
  }

  const params = token ? `?token=${token}` : '';
  const authProviders = authProviderEnabled();

  return (
    <>
      <div className="rounded p-6 border">
        <div className="flex gap-2 flex-wrap">
          {authProviders.github && <GithubButton />}
          {authProviders.google && <GoogleButton />}
        </div>

        {(authProviders.github || authProviders.google) &&
          authProviders.credentials && <div className="divider">or</div>}

        {authProviders.credentials && (
          <>
            {token ? (
              <JoinWithInvitation
                inviteToken={token}
                recaptchaSiteKey={env.recaptcha.siteKey}
              />
            ) : (
              <Join recaptchaSiteKey={env.recaptcha.siteKey} />
            )}
          </>
        )}
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        Already have an account?
        <Link
          href={`/auth/login/${params}`}
          className="font-medium text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
        >
          &nbsp;Sign In
        </Link>
      </p>
    </>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupContent />
    </Suspense>
  );
}
