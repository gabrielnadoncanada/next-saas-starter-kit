'use client';

import { InputWithLabel } from '@/components/shared';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/lib/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import type { ApiResponse } from 'types';
import { z } from 'zod';

interface ResetPasswordProps {
  token: string;
}

const resetFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must have at least 8 characters')
      .max(100, 'Password should have at most 100 characters'),
    confirmPassword: z
      .string()
      .max(100, 'Password should have at most 100 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetFormSchema>;

const ResetPassword = ({ token }: ResetPasswordProps) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, touchedFields },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    setSubmitting(true);

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({
        password: values.password,
        token,
      }),
    });

    const json = (await response.json()) as ApiResponse;

    setSubmitting(false);

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    reset();
    toast.success(t('password-updated'));
    router.push('/auth/login');
  };

  return (
    <div className="rounded p-6 border">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <InputWithLabel
            {...register('password')}
            type="password"
            label={t('new-password')}
            placeholder={t('new-password')}
            error={
              touchedFields.password ? errors.password?.message : undefined
            }
          />
          <InputWithLabel
            {...register('confirmPassword')}
            type="password"
            label={t('confirm-password')}
            placeholder={t('confirm-password')}
            error={
              touchedFields.confirmPassword
                ? errors.confirmPassword?.message
                : undefined
            }
          />
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            color="primary"
            loading={submitting}
            active={isDirty}
            fullWidth
            size="md"
          >
            {t('reset-password')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
