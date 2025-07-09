'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  inviteViaEmailSchema,
  type InviteViaEmailFormData,
} from '@/features/invitation/shared/schema/invitation.schema';
import { inviteViaEmailAction } from '../actions/inviteViaEmail.action';

interface UseInviteViaEmailFormProps {
  teamSlug: string;
  onSuccess?: () => void;
}

export function useInviteViaEmailForm({
  teamSlug,
  onSuccess,
}: UseInviteViaEmailFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<InviteViaEmailFormData>({
    resolver: zodResolver(inviteViaEmailSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', values.email);
      formData.append('role', values.role);

      const result = await inviteViaEmailAction(teamSlug, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Invitation sent successfully');
      form.reset();
      onSuccess?.();
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
  };
}
