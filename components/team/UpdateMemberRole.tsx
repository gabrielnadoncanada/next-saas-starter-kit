'use client';

import { availableRoles } from '@/lib/permissions';
import { Team, TeamMember } from '@prisma/client';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useTransition } from 'react';
import { updateMemberRoleAction } from '@/features/member';

interface UpdateMemberRoleProps {
  team: Team;
  member: TeamMember;
}

const UpdateMemberRole = ({ team, member }: UpdateMemberRoleProps) => {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const updateRole = async (member: TeamMember, role: string) => {
    startTransition(async () => {
      const result = await updateMemberRoleAction(
        team.slug,
        member.userId,
        role as any
      );

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(t('member-role-updated'));
    });
  };

  return (
    <select
      className="select select-bordered select-sm rounded"
      defaultValue={member.role}
      disabled={isPending}
      onChange={(e) => updateRole(member, e.target.value)}
    >
      {availableRoles.map((role) => (
        <option value={role.id} key={role.id}>
          {role.id}
        </option>
      ))}
    </select>
  );
};

export default UpdateMemberRole;
