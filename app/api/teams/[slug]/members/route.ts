import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
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

// Delete the member from the team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForMembers(slug);
    throwIfNotAllowed(teamMember, 'team_member', 'delete');

    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');

    const { memberId: validatedMemberId } = validateWithSchema(
      deleteMemberSchema,
      { memberId: memberId || '' }
    );

    await validateMembershipOperation(validatedMemberId, teamMember);

    const teamMemberRemoved = await removeTeamMember(
      teamMember.teamId,
      validatedMemberId
    );

    await sendEvent(teamMember.teamId, 'member.removed', teamMemberRemoved);

    sendAudit({
      action: 'member.remove',
      crud: 'd',
      user: teamMember.user,
      team: teamMember.team,
    });

    recordMetric('member.removed');

    return NextResponse.json({ data: {} });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Leave a team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForMembers(slug);
    throwIfNotAllowed(teamMember, 'team', 'leave');

    const totalTeamOwners = await countTeamMembers({
      where: {
        role: Role.OWNER,
        teamId: teamMember.teamId,
      },
    });

    if (totalTeamOwners <= 1) {
      throw new ApiError(400, 'A team should have at least one owner.');
    }

    await removeTeamMember(teamMember.teamId, teamMember.user.id);

    recordMetric('member.left');

    return NextResponse.json({ data: {} });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Update the role of a member
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForMembers(slug);
    throwIfNotAllowed(teamMember, 'team_member', 'update');

    const body = await request.json();
    const { memberId, role } = validateWithSchema(updateMemberSchema, body) as {
      memberId: string;
      role: Role;
    };

    await validateMembershipOperation(memberId, teamMember, {
      role,
    });

    const memberUpdated = await updateTeamMember({
      where: {
        teamId_userId: {
          teamId: teamMember.teamId,
          userId: memberId,
        },
      },
      data: {
        role,
      },
    });

    sendAudit({
      action: 'member.update',
      crud: 'u',
      user: teamMember.user,
      team: teamMember.team,
    });

    recordMetric('member.role.updated');

    return NextResponse.json({ data: memberUpdated });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
