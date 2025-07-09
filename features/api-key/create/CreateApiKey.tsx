'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import { useCreateApiKeyForm } from './hooks/useCreateApiKeyForm';
import { CreateApiKeyFormView } from './ui/CreateApiKeyFormView';
import { DisplayApiKeyView } from './ui/DisplayApiKeyView';

interface CreateApiKeyProps {
  teamSlug: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSuccess?: () => void;
}

export function CreateApiKey({
  teamSlug,
  visible,
  setVisible,
  onSuccess,
}: CreateApiKeyProps) {
  const { form, handleSubmit, handleClose, isPending, apiKey } =
    useCreateApiKeyForm({
      teamSlug,
      onSuccess: () => {
        onSuccess?.();
      },
      onClose: () => setVisible(false),
    });

  const toggleVisible = () => {
    setVisible(!visible);
    handleClose();
  };

  return (
    <Modal open={visible} close={toggleVisible}>
      {apiKey === '' ? (
        <CreateApiKeyFormView
          form={form}
          onSubmit={handleSubmit}
          onClose={toggleVisible}
          isPending={isPending}
        />
      ) : (
        <DisplayApiKeyView apiKey={apiKey} onClose={toggleVisible} />
      )}
    </Modal>
  );
}
