'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { deleteApiKeyAction } from '@/features/api-key/delete/actions/deleteApiKey.action';

interface UseApiKeysListProps {
  teamSlug: string;
  initialApiKeys: any[];
}

export function useApiKeysList({
  teamSlug,
  initialApiKeys,
}: UseApiKeysListProps) {
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [selectedApiKey, setSelectedApiKey] = useState<any | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const [isPending, startTransition] = useTransition();

  const deleteApiKey = async (apiKey: any | null) => {
    if (!apiKey) {
      return;
    }

    startTransition(async () => {
      const result = await deleteApiKeyAction(teamSlug, apiKey.id);

      setSelectedApiKey(null);
      setConfirmationDialogVisible(false);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Remove API key from local state
      setApiKeys(apiKeys.filter((key) => key.id !== apiKey.id));
      toast.success('API key deleted successfully');
    });
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    // In a real implementation, we might want to refetch API keys here
  };

  const handleDeleteClick = (apiKey: any) => {
    setSelectedApiKey(apiKey);
    setConfirmationDialogVisible(true);
  };

  const handleDeleteConfirm = () => {
    deleteApiKey(selectedApiKey);
  };

  const handleDeleteCancel = () => {
    setSelectedApiKey(null);
    setConfirmationDialogVisible(false);
  };

  return {
    apiKeys,
    selectedApiKey,
    createModalVisible,
    setCreateModalVisible,
    confirmationDialogVisible,
    isPending,
    handleCreateSuccess,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
}
