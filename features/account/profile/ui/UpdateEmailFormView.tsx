'use client';

import { Card, InputWithLabel } from '@/components/shared';
import { Button } from 'react-daisyui';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { UpdateEmailFormData } from '@/features/account/shared/schema/account.schema';

interface UpdateEmailFormViewProps {
  form: UseFormReturn<UpdateEmailFormData>;
  onSubmit: () => void;
  isPending: boolean;
  allowEmailChange: boolean;
}

export function UpdateEmailFormView({
  form,
  onSubmit,
  isPending,
  allowEmailChange,
}: UpdateEmailFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('email-address')}</Card.Title>
            <Card.Description>
              {t('email-address-description')}
            </Card.Description>
          </Card.Header>
          <InputWithLabel
            {...register('email')}
            type="email"
            label={t('email-address')}
            placeholder={t('your-email')}
            error={errors.email?.message}
            disabled={!allowEmailChange}
            required
          />
        </Card.Body>
        <Card.Footer>
          <Button
            type="submit"
            color="primary"
            loading={isPending}
            disabled={!isDirty || !isValid || !allowEmailChange}
            size="md"
          >
            {t('save-changes')}
          </Button>
        </Card.Footer>
      </Card>
    </form>
  );
}
