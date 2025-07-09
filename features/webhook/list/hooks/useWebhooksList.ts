'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { deleteWebhookAction } from '@/features/webhook/delete/actions/deleteWebhook.action';
import useWebhooks from 'hooks/useWebhooks';
import type { EndpointOut } from 'svix';

interface UseWebhooksListProps {
  teamSlug: string;
}

export function useWebhooksList({ teamSlug }: UseWebhooksListProps) {
  const [isPending, startTransition] = useTransition();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<EndpointOut | null>(
    null
  );
  const [editingWebhook, setEditingWebhook] = useState<EndpointOut | null>(
    null
  );

  const { isLoading, isError, webhooks, mutateWebhooks } =
    useWebhooks(teamSlug);

  const handleDelete = (webhook: EndpointOut | null) => {
    if (!webhook) return;

    startTransition(async () => {
      const result = await deleteWebhookAction(teamSlug, webhook.id);

      setSelectedWebhook(null);
      setConfirmationDialogVisible(false);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      mutateWebhooks();
      toast.success('Webhook deleted successfully');
    });
  };

  const handleDeleteClick = (webhook: EndpointOut) => {
    setSelectedWebhook(webhook);
    setConfirmationDialogVisible(true);
  };

  const handleEditClick = (webhook: EndpointOut) => {
    setEditingWebhook(webhook);
    setEditModalVisible(true);
  };

  const handleCreateSuccess = () => {
    mutateWebhooks();
    setCreateModalVisible(false);
  };

  const handleEditSuccess = () => {
    mutateWebhooks();
    setEditModalVisible(false);
    setEditingWebhook(null);
  };

  const handleDeleteCancel = () => {
    setSelectedWebhook(null);
    setConfirmationDialogVisible(false);
  };

  return {
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
  };
}
