'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'react-daisyui';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import env from '@/lib/env';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import { Alert, InputWithLabel, Loading } from '@/components/shared';
import { authProviderEnabled } from '@/lib/auth';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const loginSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const error = searchParams.get('error');
  const success = searchParams.get('success');
  const token = searchParams.get('token');

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, touchedFields },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    // Get CSRF token
    getCsrfToken().then((token) => {
      if (token) setCsrfToken(token);
    });
  }, []);

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const onSubmit = async (values: LoginFormData) => {
    const { email, password } = values;

    setMessage({ text: null, status: null });

    const response = await signIn('credentials', {
      email,
      password,
      csrfToken,
      redirect: false,
      callbackUrl: redirectUrl,
      recaptchaToken,
    });

    reset();
    recaptchaRef.current?.reset();

    if (response && !response.ok) {
      setMessage({ text: response.error, status: 'error' });
      return;
    }
  };

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(redirectUrl);
  }

  const params = token ? `?token=${token}` : '';

  // Get auth providers
  const authProviders = authProviderEnabled();

  return (
    <>
      {message.text && message.status && (
        <Alert status={message.status} className="mb-5">
          {message.text}
        </Alert>
      )}
      <div className="rounded p-6 border">
        <div className="flex gap-2 flex-wrap">
          {authProviders.github && <GithubButton />}
          {authProviders.google && <GoogleButton />}
        </div>

        {(authProviders.github || authProviders.google) &&
          authProviders.credentials && <div className="divider">or</div>}

        {authProviders.credentials && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <InputWithLabel
                {...register('email')}
                type="email"
                label="Email"
                placeholder="Email"
                error={touchedFields.email ? errors.email?.message : undefined}
              />
              <div className="relative flex">
                <InputWithLabel
                  {...register('password')}
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="Password"
                  label={
                    <label className="label">
                      <span className="label-text">Password</span>
                      <span className="label-text-alt">
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
                        >
                          Forgot Password?
                        </Link>
                      </span>
                    </label>
                  }
                  error={
                    touchedFields.password
                      ? errors.password?.message
                      : undefined
                  }
                />
                <TogglePasswordVisibility
                  isPasswordVisible={isPasswordVisible}
                  handlePasswordVisibility={handlePasswordVisibility}
                />
              </div>
              <GoogleReCAPTCHA
                recaptchaRef={recaptchaRef}
                onChange={setRecaptchaToken}
                siteKey={env.recaptcha.siteKey}
              />
            </div>
            <div className="mt-3 space-y-3">
              <Button
                type="submit"
                color="primary"
                loading={isSubmitting}
                active={isDirty}
                fullWidth
                size="md"
              >
                Sign In
              </Button>
              <AgreeMessage text="Sign In" />
            </div>
          </form>
        )}

        {(authProviders.email || authProviders.saml) && (
          <div className="divider"></div>
        )}

        <div className="space-y-3">
          {authProviders.email && (
            <Link
              href={`/auth/magic-link${params}`}
              className="btn btn-outline btn-block"
            >
              Continue with Email
            </Link>
          )}
          {authProviders.saml && (
            <Link
              href={`/auth/sso${params}`}
              className="btn btn-outline btn-block"
            >
              Continue with SAML SSO
            </Link>
          )}
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        Don&apos;t have an account?{' '}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Create a free account
        </Link>
      </p>
    </>
  );
}
