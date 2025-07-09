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
        <CardHeader>
          <CardTitle>{t('email-address')}</CardTitle>
          <CardDescription>{t('email-address-description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <InputWithLabel
            {...register('email')}
            type="email"
            label={t('email-address')}
            placeholder={t('your-email')}
            error={errors.email?.message}
            disabled={!allowEmailChange}
            required
          />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isPending || !isDirty || !isValid || !allowEmailChange}
          >
            {t('save-changes')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
