'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Button } from '@/lib/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { ApiResponse } from 'types';
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
import type { User } from '@prisma/client';

interface UpdateEmailProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

const emailSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
});

type UpdateEmailFormData = z.infer<typeof emailSchema>;

const UpdateEmail = ({ user, allowEmailChange }: UpdateEmailProps) => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user.email || '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: UpdateEmailFormData) => {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const json = (await response.json()) as ApiResponse;
      toast.error(json.error.message);
      return;
    }

    toast.success(t('successfully-updated'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent>
          <CardHeader>
            <CardTitle>{t('email-address')}</CardTitle>
            <CardDescription>{t('email-address-description')}</CardDescription>
          </CardHeader>
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
          <Button type="submit" disabled={isSubmitting || !isDirty || !isValid}>
            {t('save-changes')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UpdateEmail;
