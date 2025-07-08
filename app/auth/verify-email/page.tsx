'use client';

import { AuthLayout } from '@/components/layouts';

export default function VerifyEmail() {
  return (
    <AuthLayout
      heading="Confirm your email"
      description="We've sent you a confirmation email. Please check your inbox and click the link to verify your account."
    >
      <div />
    </AuthLayout>
  );
}
