'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function SAMLIdPLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');

    signIn('boxyhq-idp', {
      callbackUrl: '/dashboard',
      code: code || undefined,
    });
  }, [searchParams]);

  return null;
}

export default function SAMLIdPLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SAMLIdPLoginContent />
    </Suspense>
  );
}
