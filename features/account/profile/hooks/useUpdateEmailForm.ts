'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  updateEmailSchema,
  type UpdateEmailFormData,
} from '@/features/account/shared/schema/account.schema';
import { updateEmailAction } from '../actions/updateEmail.action';

interface UseUpdateEmailFormProps {
  initialEmail: string;
  allowEmailChange: boolean;
}

export function useUpdateEmailForm({
  initialEmail,
  allowEmailChange,
}: UseUpdateEmailFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      email: initialEmail,
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (!allowEmailChange) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', values.email);

      const result = await updateEmailAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Email updated successfully');
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
    allowEmailChange,
  };
}
