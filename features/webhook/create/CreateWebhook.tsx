'use client';

import { useCreateWebhookForm } from './hooks/useCreateWebhookForm';
import { WebhookFormView } from '@/features/webhook/shared/ui/WebhookFormView';
import { useTranslations } from 'next-intl';

interface CreateWebhookProps {
  teamSlug: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSuccess?: () => void;
}

export function CreateWebhook({
  teamSlug,
  visible,
  setVisible,
  onSuccess,
}: CreateWebhookProps) {
  const t = useTranslations();

  const { form, handleSubmit, handleClose, isPending } = useCreateWebhookForm({
    teamSlug,
    onSuccess,
    onClose: () => setVisible(false),
  });

  return (
    <WebhookFormView
      visible={visible}
      onClose={() => {
        handleClose();
        setVisible(false);
      }}
      form={form}
      onSubmit={handleSubmit}
      title={t('create-webhook')}
      isPending={isPending}
      editMode={false}
    />
  );
}
