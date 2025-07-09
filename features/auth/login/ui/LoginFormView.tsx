'use client';

import Link from 'next/link';
import { Button } from 'react-daisyui';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import type { UseFormReturn } from 'react-hook-form';
import type { RefObject } from 'react';
import type ReCAPTCHA from 'react-google-recaptcha';

import { Alert, InputWithLabel, Loading } from '@/components/shared';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import AgreeMessage from '@/components/auth/AgreeMessage';
import { authProviderEnabled } from '@/lib/auth-utils';
import env from '@/lib/env';
import type { LoginFormData } from '../schema/login.schema';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

interface LoginFormViewProps {
  // Form state
  form: UseFormReturn<LoginFormData>;
  isPending: boolean;
  isLoading: boolean;

  // UI state
  message: Message;
  isPasswordVisible: boolean;
  recaptchaToken: string;
  recaptchaRef: RefObject<ReCAPTCHA>;

  // Actions
  onSubmit: () => void;
  handlePasswordVisibility: () => void;
  setRecaptchaToken: (token: string) => void;

  // Data
  token?: string | null;
}

export function LoginFormView({
  form,
  isPending,
  isLoading,
  message,
  isPasswordVisible,
  recaptchaToken,
  recaptchaRef,
  onSubmit,
  handlePasswordVisibility,
  setRecaptchaToken,
  token,
}: LoginFormViewProps) {
  const {
    register,
    formState: { errors, isDirty, touchedFields },
  } = form;

  if (isLoading) {
    return <Loading />;
  }

  const params = token ? `?token=${token}` : '';
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
          <form onSubmit={onSubmit}>
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
                loading={isPending}
                active={isDirty}
                fullWidth
                size="md"
              >
                Sign In
              </Button>
            </div>
          </form>
        )}

        {authProviders.email && (
          <>
            <div className="divider">or</div>
            <div className="space-y-3">
              <Link
                href={`/auth/magic-link${params}`}
                className="btn btn-outline btn-block"
              >
                Continue with Email
              </Link>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-sm text-gray-600 mt-3">
        Don&apos;t have an account?{' '}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign up
        </Link>
      </p>

      <AgreeMessage text="Sign In" />
    </>
  );
}
