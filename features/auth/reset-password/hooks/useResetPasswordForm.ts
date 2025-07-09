'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/features/auth/shared/schema/signup.schema';
import { resetPasswordAction } from '../actions/resetPassword.action';

interface UseResetPasswordFormProps {
  token: string;
}

export function useResetPasswordForm({ token }: UseResetPasswordFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('password', values.password);

      const result = await resetPasswordAction(token, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      form.reset();
      toast.success('Password updated successfully');
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
  };
}
