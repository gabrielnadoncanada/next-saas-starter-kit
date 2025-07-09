'use client';

import { Loading, Error } from '@/components/shared';
import { useEditWebhookForm } from './hooks/useEditWebhookForm';
import { WebhookFormView } from '@/features/webhook/shared/ui/WebhookFormView';
import { useTranslations } from 'next-intl';
import useWebhook from 'hooks/useWebhook';
import type { EndpointOut } from 'svix';

interface EditWebhookProps {
  teamSlug: string;
  endpoint: EndpointOut;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSuccess?: () => void;
}

export function EditWebhook({
  teamSlug,
  endpoint,
  visible,
  setVisible,
  onSuccess,
}: EditWebhookProps) {
  const t = useTranslations();
  const { isLoading, isError, webhook } = useWebhook(teamSlug, endpoint.id);

  const { form, handleSubmit, handleClose, isPending } = useEditWebhookForm({
    teamSlug,
    webhookId: endpoint.id,
    initialValues: {
      name: (webhook?.description as string) || '',
      url: webhook?.url || '',
      eventTypes: (webhook?.filterTypes as string[]) || [],
    },
    onSuccess,
    onClose: () => setVisible(false),
  });

  if (isLoading || !webhook) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  return (
    <WebhookFormView
      visible={visible}
      onClose={() => {
        handleClose();
        setVisible(false);
      }}
      form={form}
      onSubmit={handleSubmit}
      title={t('edit-webhook-endpoint')}
      isPending={isPending}
      editMode={true}
    />
  );
}
