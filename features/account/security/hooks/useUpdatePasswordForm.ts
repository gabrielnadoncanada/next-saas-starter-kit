'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  updatePasswordSchema,
  type UpdatePasswordFormData,
} from '@/features/account/shared/schema/account.schema';
import { updatePasswordAction } from '../actions/updatePassword.action';

export function useUpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('currentPassword', values.currentPassword);
      formData.append('newPassword', values.newPassword);

      const result = await updatePasswordAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Password updated successfully');
      form.reset();
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
  };
}
