'use client';

import { availableRoles } from '@/lib/permissions';
import { Team, TeamMember } from '@prisma/client';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useTransition } from 'react';
import { updateMemberRoleAction } from '@/features/member';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';

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
    <Select
      defaultValue={member.role}
      disabled={isPending}
      onValueChange={(value) => updateRole(member, value)}
    >
      <SelectTrigger className="w-auto min-w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UpdateMemberRole;
