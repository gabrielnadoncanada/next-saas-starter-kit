'use client';

import { useMembersList } from '../hooks/useMembersList';
import { MembersListView } from './MembersListView';
import type { TeamMemberWithUser } from '../hooks/useMembersList';

interface MembersClientProps {
  team: any;
  members: TeamMemberWithUser[];
}

export function MembersClient({ team, members }: MembersClientProps) {
  const membersListLogic = useMembersList({
    team,
    initialMembers: members,
  });

  return <MembersListView {...membersListLogic} />;
}
