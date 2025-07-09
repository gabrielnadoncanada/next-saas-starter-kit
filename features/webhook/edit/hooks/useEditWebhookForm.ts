'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  webhookEndpointSchema,
  type WebhookFormData,
} from '@/features/webhook/shared/schema/webhook.schema';
import { updateWebhookAction } from '../actions/updateWebhook.action';

interface UseEditWebhookFormProps {
  teamSlug: string;
  webhookId: string;
  initialValues: WebhookFormData;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useEditWebhookForm({
  teamSlug,
  webhookId,
  initialValues,
  onSuccess,
  onClose,
}: UseEditWebhookFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookEndpointSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('url', values.url);
      formData.append('eventTypes', JSON.stringify(values.eventTypes));

      const result = await updateWebhookAction(teamSlug, webhookId, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Webhook updated successfully');
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
