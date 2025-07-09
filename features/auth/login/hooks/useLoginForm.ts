'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, getCsrfToken } from 'next-auth/react';
import { useTransition } from 'react';
import type { ComponentStatus } from '@/shared/types/common';
import type ReCAPTCHA from 'react-google-recaptcha';

import { loginSchema, type LoginFormData } from '../schema/login.schema';
import { loginUserAction } from '../actions/loginUser.action';
import env from '@/lib/env';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isPending, startTransition] = useTransition();

  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const error = searchParams.get('error');
  const success = searchParams.get('success');
  const token = searchParams.get('token');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  // Get CSRF token
  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) setCsrfToken(token);
    });
  }, []);

  // Handle URL messages
  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  // Handle redirect when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(redirectUrl);
    }
  }, [status, router, redirectUrl]);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const onSubmit = async (values: LoginFormData) => {
    setMessage({ text: null, status: null });

    startTransition(async () => {
      try {
        const result = await loginUserAction(values, token || undefined);

        if (result?.error) {
          setMessage({ text: result.error, status: 'error' });
          form.reset();
          recaptchaRef.current?.reset();
        }
      } catch (error) {
        setMessage({ text: 'An unexpected error occurred', status: 'error' });
        form.reset();
        recaptchaRef.current?.reset();
      }
    });
  };

  return {
    // Form state
    form,
    isPending,
    isLoading: status === 'loading',

    // UI state
    message,
    isPasswordVisible,
    recaptchaToken,
    csrfToken,
    recaptchaRef,

    // Actions
    onSubmit: form.handleSubmit(onSubmit),
    handlePasswordVisibility,
    setRecaptchaToken,

    // Data
    token,
    redirectUrl,
  };
}
