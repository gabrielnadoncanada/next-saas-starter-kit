import { ApiError } from '@/lib/errors';
import { sendEvent } from '@/lib/svix';
import { Role } from '@prisma/client';
import { getTeamMembers, removeTeamMember, getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import { countTeamMembers, updateTeamMember } from 'models/teamMember';
import { validateMembershipOperation } from '@/lib/rbac';
import {
  deleteMemberSchema,
  updateMemberSchema,
  validateWithSchema,
} from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForMembers(slug: string) {
  const authOptions = getAuthOptions({} as any, {} as any);
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const teamMember = await getTeamMember(session.user.id, slug);

  if (!teamMember) {
    throw new Error('You do not have access to this team');
  }

  return {
    ...teamMember,
    user: session.user,
  };
}

// Get members of a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForMembers(slug);
    throwIfNotAllowed(teamMember, 'team_member', 'read');

    const members = await getTeamMembers(teamMember.team.slug);

    recordMetric('member.fetched');

    return NextResponse.json({ data: members });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Update the role of a team member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForMembers(slug);
    throwIfNotAllowed(teamMember, 'team_member', 'update');

    const { memberId, role } = validateWithSchema(
      updateMemberSchema,
      await request.json()
    );

    await validateMembershipOperation(teamMember.role, role);

    await updateTeamMember(memberId, { role });

    recordMetric('member.updated');

    return NextResponse.json({ data: {} });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Remove a member from the team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForMembers(slug);
    throwIfNotAllowed(teamMember, 'team_member', 'delete');

    const { memberId } = validateWithSchema(
      deleteMemberSchema,
      await request.json()
    );

    // Check if the member to be deleted is the current user
    if (memberId === teamMember.user.id) {
      throw new ApiError(400, 'You cannot remove yourself from the team.');
    }

    // Check if the current user is trying to remove an owner
    const memberToDelete = await getTeamMember(memberId, slug);
    if (memberToDelete.role === Role.OWNER) {
      throw new ApiError(
        400,
        'You cannot remove an owner from the team. Please transfer ownership first.'
      );
    }

    await validateMembershipOperation(teamMember.role, memberToDelete.role);

    await removeTeamMember(teamMember.team.id, memberId);

    const totalTeamMembers = await countTeamMembers(teamMember.team.id);

    sendEvent(teamMember.team.id, 'member.removed', {
      team: teamMember.team,
      member: memberToDelete,
    });

    recordMetric('member.removed');

    return NextResponse.json({ data: { totalTeamMembers } });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
