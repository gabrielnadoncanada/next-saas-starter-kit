'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

import {
  createTeamSchema,
  type CreateTeamFormData,
} from '../schema/createTeam.schema';
import { createTeamAction } from '../actions/createTeam.action';

interface UseCreateTeamFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useCreateTeamForm({
  onSuccess,
  onClose,
}: UseCreateTeamFormProps = {}) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: CreateTeamFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);

      const result = await createTeamAction(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      form.reset();
      toast.success(t('team-created'));

      if (onSuccess) {
        onSuccess();
      }

      // Navigation is handled by the server action via redirect
    });
  };

  const handleClose = () => {
    form.reset();
    if (onClose) {
      onClose();
    } else {
      router.push('/teams');
    }
  };

  return {
    // Form state
    form,
    isPending,

    // Actions
    onSubmit: form.handleSubmit(onSubmit),
    onClose: handleClose,
  };
}
