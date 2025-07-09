'use client';

import { InputWithLabel } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { InviteViaEmailFormData } from '@/features/invitation/shared/schema/invitation.schema';

interface InviteViaEmailFormViewProps {
  form: UseFormReturn<InviteViaEmailFormData>;
  onSubmit: () => void;
  isPending: boolean;
}

export function InviteViaEmailFormView({
  form,
  onSubmit,
  isPending,
}: InviteViaEmailFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty },
  } = form;

  return (
    <div className="space-y-3 py-3">
      <div className="space-y-3">
        <h3 className="text-lg font-medium leading-none tracking-tight">
          {t('invite-via-email')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('invite-via-email-description')}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <InputWithLabel
          {...register('email')}
          label={t('email')}
          placeholder={t('email-placeholder')}
          error={errors.email?.message as string}
          required
        />

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">{t('role')}</span>
          </label>
          <select
            {...register('role')}
            className="select select-bordered w-full"
          >
            <option value="MEMBER">{t('member')}</option>
            <option value="ADMIN">{t('admin')}</option>
            <option value="OWNER">{t('owner')}</option>
          </select>
          {errors.role && (
            <div className="text-red-500 text-sm mt-1">
              {errors.role.message}
            </div>
          )}
        </div>

        <Button
          type="submit"
          color="primary"
          loading={isPending}
          disabled={!isDirty}
          size="md"
        >
          {t('send-invite')}
        </Button>
      </form>
    </div>
  );
}
