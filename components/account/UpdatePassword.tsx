'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/lib/components/ui/button';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { InputWithLabel } from '@/components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';
import { defaultHeaders } from '@/lib/common';
import { updatePasswordSchema } from '@/lib/zod';

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

const UpdatePassword = () => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid, touchedFields },
    reset,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: UpdatePasswordFormData) => {
    const response = await fetch('/api/password', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = await response.json();

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('successfully-updated'));
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty || !isValid}
              >
                {t('change-password')}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default UpdatePassword;
