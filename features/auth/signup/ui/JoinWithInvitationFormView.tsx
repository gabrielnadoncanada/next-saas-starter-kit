'use client';

import {
  InputWithLabel,
  Loading,
  Error,
  WithLoadingAndError,
} from '@/components/shared';
import { useTranslations } from 'next-intl';
import { Button } from '@/lib/components/ui/button';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import type { UseFormReturn } from 'react-hook-form';
import type { JoinWithInvitationFormData } from '@/features/auth/shared/schema/signup.schema';
import type { RefObject } from 'react';
import type ReCAPTCHA from 'react-google-recaptcha';
import type { Invitation, Team } from '@prisma/client';

interface JoinWithInvitationFormViewProps {
  form: UseFormReturn<JoinWithInvitationFormData>;
  onSubmit: () => void;
  isPending: boolean;
  isPasswordVisible: boolean;
  onPasswordVisibilityToggle: () => void;
  recaptchaToken: string;
  onRecaptchaChange: (token: string) => void;
  recaptchaRef: RefObject<ReCAPTCHA>;
  recaptchaSiteKey: string | null;
  // Invitation data
  isLoading: boolean;
  isError: any;
  invitation: (Invitation & { team: Team }) | null;
}

export function JoinWithInvitationFormView({
  form,
  onSubmit,
  isPending,
  isPasswordVisible,
  onPasswordVisibilityToggle,
  recaptchaToken,
  onRecaptchaChange,
  recaptchaRef,
  recaptchaSiteKey,
  isLoading,
  isError,
  invitation,
}: JoinWithInvitationFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty },
  } = form;

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !invitation) {
    return <Error message={isError?.message} />;
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <form className="space-y-3" onSubmit={onSubmit}>
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
            handlePasswordVisibility={onPasswordVisibilityToggle}
          />
        </div>
        <GoogleReCAPTCHA
          recaptchaRef={recaptchaRef}
          onChange={onRecaptchaChange}
          siteKey={recaptchaSiteKey}
        />
        <div className="space-y-3">
          <Button type="submit" disabled={isPending} className="w-full">
            {t('create-account')}
          </Button>
          <AgreeMessage text={t('create-account')} />
        </div>
      </form>
    </WithLoadingAndError>
  );
}
