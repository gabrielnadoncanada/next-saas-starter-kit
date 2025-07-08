'use client';

import { useState, useRef } from 'react';
import { InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { userJoinSchema } from '@/lib/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import AgreeMessage from './AgreeMessage';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';

interface JoinProps {
  recaptchaSiteKey: string | null;
}

const joinFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name should have at most 50 characters'),
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must have at least 8 characters')
    .max(100, 'Password should have at most 100 characters'),
  team: z
    .string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name should have at most 50 characters'),
});

type JoinFormData = z.infer<typeof joinFormSchema>;

const Join = ({ recaptchaSiteKey }: JoinProps) => {
  const router = useRouter();
  const t = useTranslations();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, touchedFields },
    reset,
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      team: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: JoinFormData) => {
    const response = await fetch('/api/auth/join', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        recaptchaToken,
      }),
    });

    const json = (await response.json()) as ApiResponse<{
      confirmEmail: boolean;
    }>;

    recaptchaRef.current?.reset();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    reset();

    if (json.data.confirmEmail) {
      router.push('/auth/verify-email');
    } else {
      toast.success(t('successfully-joined'));
      router.push('/auth/login');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <InputWithLabel
          {...register('name')}
          type="text"
          label={t('name')}
          placeholder={t('your-name')}
          error={touchedFields.name ? errors.name?.message : undefined}
        />
        <InputWithLabel
          {...register('team')}
          type="text"
          label={t('team')}
          placeholder={t('team-name')}
          error={errors.team?.message}
        />
        <InputWithLabel
          {...register('email')}
          type="email"
          label={t('email')}
          placeholder={t('email-placeholder')}
          error={errors.email?.message}
        />
        <div className="relative flex">
          <InputWithLabel
            {...register('password')}
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('password')}
            placeholder={t('password')}
            error={errors.password?.message}
          />
          <TogglePasswordVisibility
            isPasswordVisible={isPasswordVisible}
            handlePasswordVisibility={handlePasswordVisibility}
          />
        </div>
        <GoogleReCAPTCHA
          recaptchaRef={recaptchaRef}
          onChange={setRecaptchaToken}
          siteKey={recaptchaSiteKey}
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
          {t('create-account')}
        </Button>
        <AgreeMessage text={t('create-account')} />
      </div>
    </form>
  );
};

export default Join;
