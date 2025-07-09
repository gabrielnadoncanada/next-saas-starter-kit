'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import useCanAccess from '@/hooks/useCanAccess';
import { removeMemberAction } from '@/features/member/remove/actions/removeMember.action';

export interface TeamMemberWithUser {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface UseMembersListProps {
  team: any;
  initialMembers: TeamMemberWithUser[];
}

export function useMembersList({ team, initialMembers }: UseMembersListProps) {
  const { data: session } = useSession();
  const t = useTranslations();
  const { canAccess } = useCanAccess();

  const [members, setMembers] = useState<TeamMemberWithUser[]>(initialMembers);
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberWithUser | null>(null);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canUpdateRole = (member: TeamMemberWithUser) => {
    return (
      session?.user.id !== member.userId && canAccess('team_member', ['update'])
    );
  };

  const canRemoveMember = (member: TeamMemberWithUser) => {
    return (
      session?.user.id !== member.userId && canAccess('team_member', ['delete'])
    );
  };

  const handleRemoveMember = async (member: TeamMemberWithUser | null) => {
    if (!member) return;

    startTransition(async () => {
      const result = await removeMemberAction(team.slug, member.userId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Remove member from local state
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      setConfirmationVisible(false);
      setSelectedMember(null);
      toast.success(t('member-deleted'));
    });
  };

  const showRemoveConfirmation = (member: TeamMemberWithUser) => {
    setSelectedMember(member);
    setConfirmationVisible(true);
  };

  const hideRemoveConfirmation = () => {
    setSelectedMember(null);
    setConfirmationVisible(false);
  };

  const getTableColumns = () => {
    const cols = [t('name'), t('email'), t('role')];
    if (canAccess('team_member', ['delete'])) {
      cols.push(t('actions'));
    }
    return cols;
  };

  return {
    // Data
    members,
    selectedMember,
    team,

    // UI State
    inviteVisible,
    confirmationVisible,
    isPending,

    // Permissions
    canUpdateRole,
    canRemoveMember,
    canAccess,

    // Actions
    handleRemoveMember,
    showRemoveConfirmation,
    hideRemoveConfirmation,
    setInviteVisible,
    getTableColumns,

    // Session
    currentUserId: session?.user.id,
  };
}
