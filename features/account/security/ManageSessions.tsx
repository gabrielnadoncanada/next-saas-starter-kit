'use client';

import { useManageSessions } from './hooks/useManageSessions';
import { ManageSessionsView } from './ui/ManageSessionsView';

export function ManageSessions() {
  const {
    // Data
    sessions,
    isLoading,
    isError,
    isPending,

    // Modal states
    askConfirmation,

    // Selected items
    sessionToDelete,

    // Handlers
    handleDeleteSession,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useManageSessions();

  return (
    <ManageSessionsView
      sessions={sessions}
      isLoading={isLoading}
      isError={isError}
      isPending={isPending}
      askConfirmation={askConfirmation}
      sessionToDelete={sessionToDelete}
      onDeleteSession={handleDeleteSession}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  );
}
