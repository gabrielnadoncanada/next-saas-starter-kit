'use client';

import { InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/lib/zod';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Button } from '@/lib/components/ui/button';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import env from '@/lib/env';

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, touchedFields },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        recaptchaToken,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    reset();
    recaptchaRef.current?.reset();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success('Password reset link sent');
  };

  return (
    <>
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
            <GoogleReCAPTCHA
              recaptchaRef={recaptchaRef}
              onChange={setRecaptchaToken}
              siteKey={env.recaptcha.siteKey}
            />
          </div>
          <div className="mt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Email Password Reset Link
            </Button>
          </div>
        </form>
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        Already have an account?
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
        >
          &nbsp;Sign In
        </Link>
      </p>
    </>
  );
}
