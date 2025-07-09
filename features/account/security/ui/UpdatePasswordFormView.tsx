'use client';

import { Card, InputWithLabel } from '@/components/shared';
import { Button } from 'react-daisyui';
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
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('password')}</Card.Title>
            <Card.Description>{t('change-password-text')}</Card.Description>
          </Card.Header>
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
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              color="primary"
              loading={isPending}
              disabled={!isDirty || !isValid}
              size="md"
            >
              {t('change-password')}
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </form>
  );
}
