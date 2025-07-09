'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { deleteSessionAction } from '../actions/deleteSession.action';
import { useTranslations } from 'next-intl';
import type { Session } from '@prisma/client';

type NextAuthSession = Session & { isCurrent: boolean };

export function useManageSessions() {
  const [isPending, startTransition] = useTransition();
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [sessionToDelete, setSessionToDelete] =
    useState<NextAuthSession | null>(null);
  const t = useTranslations();

  const { data, isLoading, error, mutate } = useSWR<{
    data: NextAuthSession[];
  }>(`/api/sessions`, fetcher);

  const sessions = data?.data ?? [];

  const handleDeleteSession = (session: NextAuthSession) => {
    setSessionToDelete(session);
    setAskConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (!sessionToDelete) return;

    startTransition(async () => {
      const result = await deleteSessionAction(sessionToDelete.id);

      if (result?.error) {
        toast.error(result.error);
        setSessionToDelete(null);
        setAskConfirmation(false);
        return;
      }

      toast.success('Session removed successfully');

      if (sessionToDelete.isCurrent) {
        window.location.reload();
      }

      mutate();
      setSessionToDelete(null);
      setAskConfirmation(false);
    });
  };

  const handleDeleteCancel = () => {
    setSessionToDelete(null);
    setAskConfirmation(false);
  };

  return {
    // Data
    sessions,
    isLoading,
    isError: error,
    isPending,

    // Modal states
    askConfirmation,

    // Selected items
    sessionToDelete,

    // Handlers
    handleDeleteSession,
    handleDeleteConfirm,
    handleDeleteCancel,
  };
}
