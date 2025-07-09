'use client';

import { useWebhooksList } from './hooks/useWebhooksList';
import { WebhooksListView } from './ui/WebhooksListView';
import { CreateWebhook } from '@/features/webhook/create/CreateWebhook';
import { EditWebhook } from '@/features/webhook/edit/EditWebhook';

interface WebhooksListProps {
  teamSlug: string;
}

export function WebhooksList({ teamSlug }: WebhooksListProps) {
  const {
    // Data
    webhooks,
    isLoading,
    isError,
    isPending,

    // Modal states
    createModalVisible,
    setCreateModalVisible,
    editModalVisible,
    setEditModalVisible,
    confirmationDialogVisible,

    // Selected items
    selectedWebhook,
    editingWebhook,

    // Handlers
    handleDelete,
    handleDeleteClick,
    handleEditClick,
    handleCreateSuccess,
    handleEditSuccess,
    handleDeleteCancel,
  } = useWebhooksList({ teamSlug });

  return (
    <>
      <WebhooksListView
        webhooks={webhooks}
        isLoading={isLoading}
        isError={isError}
        isPending={isPending}
        confirmationDialogVisible={confirmationDialogVisible}
        onCreateClick={() => setCreateModalVisible(true)}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onDeleteConfirm={() => handleDelete(selectedWebhook)}
        onDeleteCancel={handleDeleteCancel}
      />

      <CreateWebhook
        teamSlug={teamSlug}
        visible={createModalVisible}
        setVisible={setCreateModalVisible}
        onSuccess={handleCreateSuccess}
      />

      {editingWebhook && (
        <EditWebhook
          teamSlug={teamSlug}
          endpoint={editingWebhook}
          visible={editModalVisible}
          setVisible={setEditModalVisible}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
