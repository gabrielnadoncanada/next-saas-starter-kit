'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  webhookEndpointSchema,
  type WebhookFormData,
} from '@/features/webhook/shared/schema/webhook.schema';
import { createWebhookAction } from '../actions/createWebhook.action';

interface UseCreateWebhookFormProps {
  teamSlug: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useCreateWebhookForm({
  teamSlug,
  onSuccess,
  onClose,
}: UseCreateWebhookFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookEndpointSchema),
    defaultValues: {
      name: '',
      url: '',
      eventTypes: [],
    },
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('url', values.url);
      formData.append('eventTypes', JSON.stringify(values.eventTypes));

      const result = await createWebhookAction(teamSlug, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Webhook created successfully');
      form.reset();
      onSuccess?.();
      onClose?.();
    });
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

  return {
    form,
    handleSubmit,
    handleClose,
    isPending,
  };
}
