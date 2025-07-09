'use client';

import { LetterAvatar, WithLoadingAndError } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Table } from '@/components/shared/table/Table';
import { useTranslations } from 'next-intl';
import type { TeamInvitation } from 'models/invitation';

interface PendingInvitationsViewProps {
  invitations: TeamInvitation[];
  isLoading: boolean;
  isError: any;
  isPending: boolean;
  confirmationDialogVisible: boolean;
  selectedInvitation: TeamInvitation | null;
  onDeleteClick: (invitation: TeamInvitation) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function PendingInvitationsView({
  invitations,
  isLoading,
  isError,
  isPending,
  confirmationDialogVisible,
  selectedInvitation,
  onDeleteClick,
  onDeleteConfirm,
  onDeleteCancel,
}: PendingInvitationsViewProps) {
  const t = useTranslations();

  if (!invitations || !invitations.length) {
    return null;
  }

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="space-y-3">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('pending-invitations')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('description-invitations')}
          </p>
        </div>

        <Table
          cols={[t('email'), t('role'), t('expires-at'), t('actions')]}
          body={invitations.map((invitation) => {
            return {
              id: invitation.id,
              cells: [
                {
                  wrap: true,
                  element: invitation.email ? (
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={invitation.email} />
                      <span>{invitation.email}</span>
                    </div>
                  ) : undefined,
                  minWidth: 250,
                },
                { text: invitation.role },
                {
                  wrap: true,
                  text: new Date(invitation.expires).toDateString(),
                  minWidth: 160,
                },
                {
                  buttons: [
                    {
                      color: 'error',
                      text: t('remove'),
                      disabled: isPending,
                      onClick: () => onDeleteClick(invitation),
                    },
                  ],
                },
              ],
            };
          })}
        />

        <ConfirmationDialog
          visible={confirmationDialogVisible}
          onCancel={onDeleteCancel}
          onConfirm={onDeleteConfirm}
          title={t('confirm-delete-member-invitation')}
        >
          {t('delete-member-invitation-warning', {
            email: selectedInvitation?.email || '',
          })}
        </ConfirmationDialog>
      </div>
    </WithLoadingAndError>
  );
}
