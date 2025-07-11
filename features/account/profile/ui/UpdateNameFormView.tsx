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
import { UpdateNameFormData } from '@/features/account/shared/schema/account.schema';

interface UpdateNameFormViewProps {
  form: UseFormReturn<UpdateNameFormData>;
  onSubmit: () => void;
  isPending: boolean;
}

export function UpdateNameFormView({
  form,
  onSubmit,
  isPending,
}: UpdateNameFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('name')}</CardTitle>
          <CardDescription>{t('update-your-name')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <InputWithLabel
              {...register('name')}
              label={t('name')}
              placeholder={t('your-name')}
              error={errors.name?.message}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !isDirty || !isValid}>
              {t('save-changes')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
