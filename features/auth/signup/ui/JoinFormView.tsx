'use client';

import { InputWithLabel } from '@/components/shared';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import type { UseFormReturn } from 'react-hook-form';
import type { JoinFormData } from '@/features/auth/shared/schema/signup.schema';
import type { RefObject } from 'react';
import type ReCAPTCHA from 'react-google-recaptcha';

interface JoinFormViewProps {
  form: UseFormReturn<JoinFormData>;
  onSubmit: () => void;
  isPending: boolean;
  isPasswordVisible: boolean;
  onPasswordVisibilityToggle: () => void;
  recaptchaToken: string;
  onRecaptchaChange: (token: string) => void;
  recaptchaRef: RefObject<ReCAPTCHA>;
  recaptchaSiteKey: string | null;
}

export function JoinFormView({
  form,
  onSubmit,
  isPending,
  isPasswordVisible,
  onPasswordVisibilityToggle,
  recaptchaToken,
  onRecaptchaChange,
  recaptchaRef,
  recaptchaSiteKey,
}: JoinFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, touchedFields },
  } = form;

  return (
    <form onSubmit={onSubmit}>
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
            handlePasswordVisibility={onPasswordVisibilityToggle}
          />
        </div>
        <GoogleReCAPTCHA
          recaptchaRef={recaptchaRef}
          onChange={onRecaptchaChange}
          siteKey={recaptchaSiteKey}
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
          {t('create-account')}
        </Button>
        <AgreeMessage text={t('create-account')} />
      </div>
    </form>
  );
}
