'use client';

import { usePendingInvitations } from './hooks/usePendingInvitations';
import { PendingInvitationsView } from './ui/PendingInvitationsView';

interface PendingInvitationsProps {
  teamSlug: string;
}

export function PendingInvitations({ teamSlug }: PendingInvitationsProps) {
  const {
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
  } = usePendingInvitations({ teamSlug });

  return (
    <PendingInvitationsView
      invitations={invitations}
      isLoading={isLoading}
      isError={isError}
      isPending={isPending}
      confirmationDialogVisible={confirmationDialogVisible}
      selectedInvitation={selectedInvitation}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={() => handleDelete(selectedInvitation)}
      onDeleteCancel={handleDeleteCancel}
    />
  );
}
