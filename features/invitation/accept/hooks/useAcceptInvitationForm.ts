'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  acceptInvitationSchema,
  type AcceptInvitationFormData,
} from '@/features/invitation/shared/schema/invitation.schema';
import { acceptInvitationAction } from '../actions/acceptInvitation.action';

interface UseAcceptInvitationFormProps {
  token: string;
}

export function useAcceptInvitationForm({
  token,
}: UseAcceptInvitationFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token,
      name: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('password', values.password);

      const result = await acceptInvitationAction(token, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // The action will handle the redirect on success
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
  };
}
