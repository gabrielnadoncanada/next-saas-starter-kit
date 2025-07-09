'use client';

import { useApiKeysList } from './hooks/useApiKeysList';
import { ApiKeysListView } from './ui/ApiKeysListView';
import { CreateApiKey } from '@/features/api-key/create/CreateApiKey';

interface ApiKeysListProps {
  teamSlug: string;
  apiKeys: any[];
}

export function ApiKeysList({ teamSlug, apiKeys }: ApiKeysListProps) {
  const {
    apiKeys: currentApiKeys,
    selectedApiKey,
    createModalVisible,
    setCreateModalVisible,
    confirmationDialogVisible,
    isPending,
    handleCreateSuccess,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useApiKeysList({ teamSlug, initialApiKeys: apiKeys });

  return (
    <>
      <ApiKeysListView
        apiKeys={currentApiKeys}
        selectedApiKey={selectedApiKey}
        confirmationDialogVisible={confirmationDialogVisible}
        isPending={isPending}
        onCreateClick={() => setCreateModalVisible(true)}
        onDeleteClick={handleDeleteClick}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={handleDeleteCancel}
      />
      <CreateApiKey
        teamSlug={teamSlug}
        visible={createModalVisible}
        setVisible={setCreateModalVisible}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
