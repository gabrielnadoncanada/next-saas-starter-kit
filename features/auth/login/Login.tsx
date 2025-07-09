'use client';

import { Suspense } from 'react';
import { useLoginForm } from './hooks/useLoginForm';
import { LoginFormView } from './ui/LoginFormView';
import { Loading } from '@/components/shared';

function LoginContent() {
  const loginFormState = useLoginForm();

  return <LoginFormView {...loginFormState} />;
}

export function Login() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginContent />
    </Suspense>
  );
}
