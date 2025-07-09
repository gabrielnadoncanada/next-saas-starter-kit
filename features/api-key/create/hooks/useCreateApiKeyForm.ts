'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  createApiKeySchema,
  type CreateApiKeyFormData,
} from '@/features/api-key/shared/schema/apiKey.schema';
import { createApiKeyAction } from '../actions/createApiKey.action';

interface UseCreateApiKeyFormProps {
  teamSlug: string;
  onSuccess?: (apiKey: string) => void;
  onClose?: () => void;
}

export function useCreateApiKeyForm({
  teamSlug,
  onSuccess,
  onClose,
}: UseCreateApiKeyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [apiKey, setApiKey] = useState<string>('');

  const form = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);

      const result = await createApiKeyAction(teamSlug, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.data) {
        setApiKey(result.data);
        onSuccess?.(result.data);
        toast.success('API key created successfully');
      }
    });
  });

  const handleClose = () => {
    setApiKey('');
    form.reset();
    onClose?.();
  };

  return {
    form,
    handleSubmit,
    handleClose,
    isPending,
    apiKey,
    setApiKey,
  };
}
