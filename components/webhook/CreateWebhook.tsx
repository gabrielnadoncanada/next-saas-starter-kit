import type { Team } from '@prisma/client';
import useWebhooks from 'hooks/useWebhooks';
import { useTranslations } from 'next-intl';
import React from 'react';
import toast from 'react-hot-toast';
import type { ApiResponse } from 'types';
import type { WebhookFormSchema } from 'types';

import ModalForm from './Form';
import { defaultHeaders } from '@/lib/common';

const CreateWebhook = ({
  visible,
  setVisible,
  team,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  team: Team;
}) => {
  const { mutateWebhooks } = useWebhooks(team.slug);
  const t = useTranslations();

  const onSubmit = async (
    values: WebhookFormSchema,
    helpers: { resetForm: () => void }
  ) => {
    const response = await fetch(`/api/teams/${team.slug}/webhooks`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    const json = (await response.json()) as ApiResponse<Team>;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    toast.success(t('webhook-created'));
    mutateWebhooks();
    setVisible(false);
    helpers.resetForm();
  };

  return (
    <ModalForm
      visible={visible}
      setVisible={setVisible}
      initialValues={{
        name: '',
        url: '',
        eventTypes: [],
      }}
      onSubmit={onSubmit}
      title={t('create-webhook')}
    />
  );
};

export default CreateWebhook;
