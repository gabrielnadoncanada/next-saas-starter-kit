'use client';

import {
  Error,
  InputWithLabel,
  Loading,
  WithLoadingAndError,
} from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import useInvitation from 'hooks/useInvitation';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import { useRef, useState } from 'react';
import AgreeMessage from './AgreeMessage';
import GoogleReCAPTCHA from '../shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';

interface JoinWithInvitationProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

const joinUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name should have at most 100 characters'),
    password: z
      .string()
      .min(8, 'Password must have at least 8 characters')
      .max(100, 'Password should have at most 100 characters'),
    sentViaEmail: z.boolean(),
    email: z
      .string()
      .max(100, 'Email should have at most 100 characters')
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.sentViaEmail && (!data.email || data.email === '')) {
        return false;
      }
      if (
        !data.sentViaEmail &&
        data.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Email is required and must be valid when not sent via email',
      path: ['email'],
    }
  );

type JoinUserFormData = z.infer<typeof joinUserSchema>;

const JoinWithInvitation = ({
  inviteToken,
  recaptchaSiteKey,
}: JoinWithInvitationProps) => {
  const router = useRouter();
  const t = useTranslations();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { isLoading, error, invitation } = useInvitation();
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<JoinUserFormData>({
    resolver: zodResolver(joinUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      sentViaEmail: invitation?.sentViaEmail || true,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: JoinUserFormData) => {
    const response = await fetch('/api/auth/join', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        ...values,
        recaptchaToken,
        inviteToken,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    recaptchaRef.current?.reset();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    reset();
    toast.success(t('successfully-joined'));
    router.push(`/auth/login?token=${inviteToken}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error.message} />;
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={error}>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <InputWithLabel
          {...register('name')}
          type="text"
          label={t('name')}
          placeholder={t('your-name')}
          error={errors.name?.message}
        />

        {invitation.sentViaEmail ? (
          <InputWithLabel
            type="email"
            label={t('email')}
            value={invitation.email!}
            disabled
          />
        ) : (
          <InputWithLabel
            {...register('email')}
            type="email"
            label={t('email')}
            placeholder={t('email')}
            error={errors.email?.message}
          />
        )}

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
        <div className="space-y-3">
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
    </WithLoadingAndError>
  );
};

export default JoinWithInvitation;
