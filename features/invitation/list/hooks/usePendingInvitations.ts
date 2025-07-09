'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { deleteInvitationAction } from '@/features/invitation/manage/actions/deleteInvitation.action';
import useInvitations from '@/features/invitation/shared/hooks/useInvitations';
import type { TeamInvitation } from 'models/invitation';

interface UsePendingInvitationsProps {
  teamSlug: string;
}

export function usePendingInvitations({
  teamSlug,
}: UsePendingInvitationsProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedInvitation, setSelectedInvitation] =
    useState<TeamInvitation | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { isLoading, isError, invitations, mutateInvitation } = useInvitations({
    slug: teamSlug,
    sentViaEmail: true,
  });

  const handleDelete = (invitation: TeamInvitation | null) => {
    if (!invitation) return;

    startTransition(async () => {
      const result = await deleteInvitationAction(teamSlug, invitation.id);

      setSelectedInvitation(null);
      setConfirmationDialogVisible(false);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      mutateInvitation();
      toast.success('Invitation deleted successfully');
    });
  };

  const handleDeleteClick = (invitation: TeamInvitation) => {
    setSelectedInvitation(invitation);
    setConfirmationDialogVisible(true);
  };

  const handleDeleteCancel = () => {
    setSelectedInvitation(null);
    setConfirmationDialogVisible(false);
  };

  return {
    // Data
    invitations,
    isLoading,
    isError,
    isPending,

    // Modal states
    confirmationDialogVisible,

    // Selected items
    selectedInvitation,

    // Handlers
    handleDelete,
    handleDeleteClick,
    handleDeleteCancel,
  };
}
