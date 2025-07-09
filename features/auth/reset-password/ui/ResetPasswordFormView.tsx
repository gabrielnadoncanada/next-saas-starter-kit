'use client';

import { InputWithLabel } from '@/components/shared';
import { useTranslations } from 'next-intl';
import { Button } from 'react-daisyui';
import type { UseFormReturn } from 'react-hook-form';
import type { ResetPasswordFormData } from '@/features/auth/shared/schema/signup.schema';

interface ResetPasswordFormViewProps {
  form: UseFormReturn<ResetPasswordFormData>;
  onSubmit: () => void;
  isPending: boolean;
}

export function ResetPasswordFormView({
  form,
  onSubmit,
  isPending,
}: ResetPasswordFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, touchedFields },
  } = form;

  return (
    <div className="rounded p-6 border">
      <form onSubmit={onSubmit}>
        <div className="space-y-2">
          <InputWithLabel
            {...register('password')}
            type="password"
            label={t('new-password')}
            placeholder={t('new-password')}
            error={
              touchedFields.password ? errors.password?.message : undefined
            }
          />
          <InputWithLabel
            {...register('confirmPassword')}
            type="password"
            label={t('confirm-password')}
            placeholder={t('confirm-password')}
            error={
              touchedFields.confirmPassword
                ? errors.confirmPassword?.message
                : undefined
            }
          />
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            color="primary"
            loading={isPending}
            active={isDirty}
            fullWidth
            size="md"
          >
            {t('reset-password')}
          </Button>
        </div>
      </form>
    </div>
  );
}
