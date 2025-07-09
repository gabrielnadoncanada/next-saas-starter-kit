'use client';

import { InputWithLabel } from '@/components/shared';
import { Button } from '@/lib/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
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
    setValue,
    watch,
  } = form;

  const currentRole = watch('role');

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

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('role')}
          </label>
          <Select
            value={currentRole}
            onValueChange={(value) => setValue('role', value as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('select-role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">{t('member')}</SelectItem>
              <SelectItem value="ADMIN">{t('admin')}</SelectItem>
              <SelectItem value="OWNER">{t('owner')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <div className="text-red-500 text-sm mt-1">
              {errors.role.message}
            </div>
          )}
        </div>

        <Button type="submit" disabled={isPending || !isDirty}>
          {t('send-invite')}
        </Button>
      </form>
    </div>
  );
}
