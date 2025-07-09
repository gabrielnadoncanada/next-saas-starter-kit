'use client';

import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';

import { LetterAvatar } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { Table } from '@/components/shared/table/Table';
import { InviteMember } from '@/features/invitation';
import UpdateMemberRole from '@/components/team/UpdateMemberRole';
import type { TeamMemberWithUser } from '../hooks/useMembersList';

interface MembersListViewProps {
  // Data
  members: TeamMemberWithUser[];
  selectedMember: TeamMemberWithUser | null;
  team: any;

  // UI State
  inviteVisible: boolean;
  confirmationVisible: boolean;
  isPending: boolean;

  // Permissions
  canUpdateRole: (member: TeamMemberWithUser) => boolean;
  canRemoveMember: (member: TeamMemberWithUser) => boolean;

  // Actions
  handleRemoveMember: (member: TeamMemberWithUser | null) => void;
  showRemoveConfirmation: (member: TeamMemberWithUser) => void;
  hideRemoveConfirmation: () => void;
  setInviteVisible: (visible: boolean) => void;
  getTableColumns: () => string[];
}

export function MembersListView({
  members,
  selectedMember,
  team,
  inviteVisible,
  confirmationVisible,
  isPending,
  canUpdateRole,
  canRemoveMember,
  handleRemoveMember,
  showRemoveConfirmation,
  hideRemoveConfirmation,
  setInviteVisible,
  getTableColumns,
}: MembersListViewProps) {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-xl font-medium leading-none tracking-tight">
            {t('members')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('members-description')}
          </p>
        </div>
        <Button onClick={() => setInviteVisible(!inviteVisible)}>
          {t('add-member')}
        </Button>
      </div>

      <Table
        cols={getTableColumns()}
        body={members.map((member) => ({
          id: member.id,
          cells: [
            {
              wrap: true,
              element: (
                <div className="flex items-center justify-start space-x-2">
                  <LetterAvatar name={member.user.name} />
                  <span>{member.user.name}</span>
                </div>
              ),
              minWidth: 200,
            },
            {
              wrap: true,
              text: member.user.email,
              minWidth: 250,
            },
            {
              element: canUpdateRole(member) ? (
                <UpdateMemberRole
                  team={team}
                  member={{
                    ...member,
                    role: member.role as any,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }}
                />
              ) : (
                <span>{member.role}</span>
              ),
            },
            {
              buttons: canRemoveMember(member)
                ? [
                    {
                      color: 'error',
                      text: t('remove'),
                      disabled: isPending,
                      onClick: () => showRemoveConfirmation(member),
                    },
                  ]
                : [],
            },
          ],
        }))}
      />

      <ConfirmationDialog
        visible={confirmationVisible}
        onCancel={hideRemoveConfirmation}
        onConfirm={() => handleRemoveMember(selectedMember)}
        title={t('confirm-delete-member')}
      >
        {t('delete-member-warning', {
          name: selectedMember?.user.name || '',
          email: selectedMember?.user.email || '',
        })}
      </ConfirmationDialog>

      <InviteMember
        visible={inviteVisible}
        setVisible={setInviteVisible}
        teamSlug={team.slug}
      />
    </div>
  );
}
