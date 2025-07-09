'use client';

import { WithLoadingAndError } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Table } from '@/components/shared/table/Table';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import type { Session } from '@prisma/client';

type NextAuthSession = Session & { isCurrent: boolean };

interface ManageSessionsViewProps {
  sessions: NextAuthSession[];
  isLoading: boolean;
  isError: any;
  isPending: boolean;
  askConfirmation: boolean;
  sessionToDelete: NextAuthSession | null;
  onDeleteSession: (session: NextAuthSession) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function ManageSessionsView({
  sessions,
  isLoading,
  isError,
  isPending,
  askConfirmation,
  sessionToDelete,
  onDeleteSession,
  onDeleteConfirm,
  onDeleteCancel,
}: ManageSessionsViewProps) {
  const t = useTranslations();

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="space-y-2">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('browser-sessions')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('manage-sessions')}
          </p>
        </div>

        <Table
          cols={[t('device'), t('actions')]}
          body={sessions.map((session) => {
            return {
              id: session.id,
              cells: [
                {
                  wrap: true,
                  element: (
                    <span className="items-center flex">
                      <ComputerDesktopIcon className="w-6 h-6 inline-block mr-1 text-primary" />
                      {session.isCurrent ? t('this-browser') : t('other')}
                    </span>
                  ),
                },
                {
                  buttons: [
                    {
                      color: 'error',
                      text: t('remove'),
                      disabled: isPending,
                      onClick: () => onDeleteSession(session),
                    },
                  ],
                },
              ],
            };
          })}
        />

        {sessionToDelete && (
          <ConfirmationDialog
            visible={askConfirmation}
            title={t('remove-browser-session')}
            onCancel={onDeleteCancel}
            onConfirm={onDeleteConfirm}
            confirmText={t('remove')}
          >
            {sessionToDelete?.isCurrent
              ? t('remove-current-browser-session-warning')
              : t('remove-other-browser-session-warning')}
          </ConfirmationDialog>
        )}
      </div>
    </WithLoadingAndError>
  );
}
