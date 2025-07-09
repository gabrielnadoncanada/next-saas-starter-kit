'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { deleteTeamAction } from '../actions/deleteTeam.action';

interface UseDeleteTeamProps {
  teamSlug: string;
  onSuccess?: () => void;
}

export function useDeleteTeam({ teamSlug, onSuccess }: UseDeleteTeamProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [askConfirmation, setAskConfirmation] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTeamAction(teamSlug);

      setAskConfirmation(false);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Team removed successfully');
      onSuccess?.();
      router.push('/teams');
    });
  };

  const handleDeleteClick = () => {
    setAskConfirmation(true);
  };

  const handleCancel = () => {
    setAskConfirmation(false);
  };

  return {
    isPending,
    askConfirmation,
    handleDelete,
    handleDeleteClick,
    handleCancel,
  };
}
