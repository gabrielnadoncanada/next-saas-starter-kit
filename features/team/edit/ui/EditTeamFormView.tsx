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

interface EditTeamFormViewProps {
  form: UseFormReturn<any>;
  onSubmit: () => void;
  isPending: boolean;
}

export function EditTeamFormView({
  form,
  onSubmit,
  isPending,
}: EditTeamFormViewProps) {
  const t = useTranslations();
  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardContent>
          <CardHeader>
            <CardTitle>{t('team-settings')}</CardTitle>
            <CardDescription>{t('team-settings-description')}</CardDescription>
          </CardHeader>
          <div className="flex flex-col space-y-4">
            <InputWithLabel
              {...register('name')}
              label={t('name')}
              error={errors.name?.message as string}
            />
            <InputWithLabel
              {...register('slug')}
              label={t('slug')}
              error={errors.slug?.message as string}
            />
            <InputWithLabel
              {...register('domain')}
              label={t('domain')}
              error={errors.domain?.message as string}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !isValid || !isDirty}>
              {t('save-changes')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
