'use client';

import { useDeleteTeam } from './hooks/useDeleteTeam';
import { DeleteTeamView } from './ui/DeleteTeamView';

interface DeleteTeamProps {
  teamSlug: string;
  allowDelete: boolean;
  onSuccess?: () => void;
}

export function DeleteTeam({
  teamSlug,
  allowDelete,
  onSuccess,
}: DeleteTeamProps) {
  const {
    isPending,
    askConfirmation,
    handleDelete,
    handleDeleteClick,
    handleCancel,
  } = useDeleteTeam({ teamSlug, onSuccess });

  return (
    <DeleteTeamView
      allowDelete={allowDelete}
      isPending={isPending}
      askConfirmation={askConfirmation}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleCancel}
    />
  );
}
