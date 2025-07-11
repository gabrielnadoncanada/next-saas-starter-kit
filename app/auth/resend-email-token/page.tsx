'use client';

import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/shared';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { resendEmailToken } from '@/lib/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/lib/components/ui/button';
import type { ComponentStatus } from '@/shared/types/common';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ApiResponse } from 'types';
import { z } from 'zod';

type ResendEmailFormData = z.infer<typeof resendEmailToken>;

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{
    text: string | null;
    status: ComponentStatus | null;
  }>({
    text: null,
    status: null,
  });

  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }
  }, [error]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, touchedFields },
    reset,
  } = useForm<ResendEmailFormData>({
    resolver: zodResolver(resendEmailToken),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ResendEmailFormData) => {
    const response = await fetch('/api/auth/resend-email-token', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    reset();
    toast.success('Verification link sent successfully!');
    router.push('/auth/verify-email');
  };

  return (
    <AuthLayout heading="Verify your account">
      {message.text && message.status && (
        <Alert variant={message.status === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      <div className="rounded p-6 border">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <InputWithLabel
              {...register('email')}
              type="email"
              label="Email"
              placeholder="Email"
              error={touchedFields.email ? errors.email?.message : undefined}
            />
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Resend link
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function VerifyAccount() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyAccountContent />
    </Suspense>
  );
}
