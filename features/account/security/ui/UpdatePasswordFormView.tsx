'use client';

import { InputWithLabel } from '@/components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { UpdatePasswordFormData } from '@/features/account/shared/schema/account.schema';

interface UpdatePasswordFormViewProps {
  form: UseFormReturn<UpdatePasswordFormData>;
  onSubmit: () => void;
  isPending: boolean;
}

export function UpdatePasswordFormView({
  form,
  onSubmit,
  isPending,
}: UpdatePasswordFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, isValid, touchedFields },
  } = form;

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('password')}</CardTitle>
          <CardDescription>{t('change-password-text')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <InputWithLabel
              {...register('currentPassword')}
              type="password"
              label={t('current-password')}
              placeholder={t('current-password')}
              error={
                touchedFields.currentPassword
                  ? errors.currentPassword?.message
                  : undefined
              }
              className="text-sm"
            />
            <InputWithLabel
              {...register('newPassword')}
              type="password"
              label={t('new-password')}
              placeholder={t('new-password')}
              error={
                touchedFields.newPassword
                  ? errors.newPassword?.message
                  : undefined
              }
              className="text-sm"
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !isDirty || !isValid}>
              {t('change-password')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
