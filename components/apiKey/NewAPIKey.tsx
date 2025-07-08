import { InputWithCopyButton, InputWithLabel } from '@/components/shared';
import type { Team } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import type { ApiResponse } from 'types';
import Modal from '../shared/Modal';
import { defaultHeaders } from '@/lib/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createApiKeySchema } from '@/lib/zod';

const NewAPIKey = ({
  team,
  createModalVisible,
  setCreateModalVisible,
}: NewAPIKeyProps) => {
  const { mutate } = useSWRConfig();
  const [apiKey, setApiKey] = useState('');

  const onNewAPIKey = (apiKey: string) => {
    setApiKey(apiKey);
    mutate(`/api/teams/${team.slug}/api-keys`);
  };

  const toggleVisible = () => {
    setCreateModalVisible(!createModalVisible);
    setApiKey('');
  };

  return (
    <Modal open={createModalVisible} close={toggleVisible}>
      {apiKey === '' ? (
        <CreateAPIKeyForm
          team={team}
          onNewAPIKey={onNewAPIKey}
          closeModal={toggleVisible}
        />
      ) : (
        <DisplayAPIKey apiKey={apiKey} closeModal={toggleVisible} />
      )}
    </Modal>
  );
};

type CreateApiKeyFormData = z.infer<typeof createApiKeySchema>;

const CreateAPIKeyForm = ({
  team,
  onNewAPIKey,
  closeModal,
}: CreateAPIKeyFormProps) => {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<CreateApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: CreateApiKeyFormData) => {
    const response = await fetch(`/api/teams/${team.slug}/api-keys`, {
      method: 'POST',
      body: JSON.stringify(values),
      headers: defaultHeaders,
    });

    const { data, error } = (await response.json()) as ApiResponse<{
      apiKey: string;
    }>;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.apiKey) {
      onNewAPIKey(data.apiKey);
      toast.success(t('api-key-created'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST">
      <Modal.Header>{t('new-api-key')}</Modal.Header>
      <Modal.Description>{t('api-key-description')}</Modal.Description>
      <Modal.Body>
        <InputWithLabel
          {...register('name')}
          label={t('name')}
          placeholder="My API Key"
          className="text-sm"
          error={errors.name?.message}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={closeModal} size="md">
          {t('close')}
        </Button>
        <Button
          color="primary"
          type="submit"
          loading={isSubmitting}
          disabled={!isDirty || !isValid}
          size="md"
        >
          {t('create-api-key')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

const DisplayAPIKey = ({ apiKey, closeModal }: DisplayAPIKeyProps) => {
  const t = useTranslations();

  return (
    <>
      <Modal.Header>{t('new-api-key')}</Modal.Header>
      <Modal.Description>{t('new-api-warning')}</Modal.Description>
      <Modal.Body>
        <InputWithCopyButton
          label={t('api-key')}
          value={apiKey}
          className="text-sm"
          readOnly
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline" onClick={closeModal} size="md">
          {t('close')}
        </Button>
      </Modal.Footer>
    </>
  );
};

interface NewAPIKeyProps {
  team: Team;
  createModalVisible: boolean;
  setCreateModalVisible: (visible: boolean) => void;
}

interface CreateAPIKeyFormProps {
  team: Team;
  onNewAPIKey: (apiKey: string) => void;
  closeModal: () => void;
}

interface DisplayAPIKeyProps {
  apiKey: string;
  closeModal: () => void;
}

export default NewAPIKey;
