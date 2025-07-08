import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitationCount,
  getInvitations,
  isInvitationExpired,
} from 'models/invitation';
import { addTeamMember, getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import { extractEmailDomain, isEmailAllowed } from '@/lib/email/utils';
import { Invitation, Role } from '@prisma/client';
import { countTeamMembers } from 'models/teamMember';
import {
  acceptInvitationSchema,
  deleteInvitationSchema,
  getInvitationsSchema,
  inviteViaEmailSchema,
  validateWithSchema,
} from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForInvitations(slug: string) {
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

// Get all invitations for a team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForInvitations(slug);
    throwIfNotAllowed(teamMember, 'team_invitation', 'read');

    const url = new URL(request.url);
    const sentViaEmail = url.searchParams.get('sentViaEmail');

    const { sentViaEmail: validatedSentViaEmail } = validateWithSchema(
      getInvitationsSchema,
      { sentViaEmail: sentViaEmail || 'false' }
    );

    const invitations = await getInvitations(
      teamMember.teamId,
      validatedSentViaEmail === 'true'
    );

    recordMetric('invitation.fetched');

    return NextResponse.json({ data: invitations });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Invite a user to a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForInvitations(slug);
    throwIfNotAllowed(teamMember, 'team_invitation', 'create');

    const body = await request.json();
    const { email, role, sentViaEmail, domains } = validateWithSchema(
      inviteViaEmailSchema,
      body
    ) as {
      email?: string;
      role: Role;
      sentViaEmail: boolean;
      domains?: string;
    };

    let invitation: undefined | Invitation = undefined;

    // Invite via email
    if (sentViaEmail) {
      if (!email) {
        throw new ApiError(400, 'Email is required.');
      }

      if (!isEmailAllowed(email)) {
        throw new ApiError(
          400,
          'It seems you entered a non-business email. Invitations can only be sent to work emails.'
        );
      }

      const memberExists = await countTeamMembers({
        where: {
          teamId: teamMember.teamId,
          user: {
            email,
          },
        },
      });

      if (memberExists) {
        throw new ApiError(400, 'This user is already a member of the team.');
      }

      const invitationExists = await getInvitationCount({
        where: {
          email,
          teamId: teamMember.teamId,
        },
      });

      if (invitationExists) {
        throw new ApiError(400, 'An invitation already exists for this email.');
      }

      invitation = await createInvitation({
        teamId: teamMember.teamId,
        invitedBy: teamMember.userId,
        email,
        role,
        sentViaEmail: true,
        allowedDomains: [],
      });
    }

    // Invite via link
    if (!sentViaEmail) {
      invitation = await createInvitation({
        teamId: teamMember.teamId,
        invitedBy: teamMember.userId,
        role,
        email: null,
        sentViaEmail: false,
        allowedDomains: domains
          ? domains.split(',').map((d) => d.trim().toLowerCase())
          : [],
      });
    }

    if (!invitation) {
      throw new ApiError(400, 'Could not create invitation. Please try again.');
    }

    if (invitation.sentViaEmail) {
      await sendTeamInviteEmail(teamMember.team, invitation);
    }

    await sendEvent(teamMember.teamId, 'invitation.created', invitation);

    sendAudit({
      action: 'member.invitation.create',
      crud: 'c',
      user: teamMember.user,
      team: teamMember.team,
    });

    recordMetric('invitation.created');

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Accept an invitation to an organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { inviteToken } = validateWithSchema(
      acceptInvitationSchema,
      body as { inviteToken: string }
    );

    const invitation = await getInvitation({ token: inviteToken });

    if (await isInvitationExpired(invitation.expires)) {
      throw new ApiError(400, 'Invitation expired. Please request a new one.');
    }

    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error('Unauthorized');
    }

    const email = session.user.email as string;

    // Make sure the user is logged in with the invited email address (Join via email)
    if (invitation.sentViaEmail && invitation.email !== email) {
      throw new ApiError(
        400,
        'You must be logged in with the email address you were invited with.'
      );
    }

    // Make sure the user is logged in with an allowed domain (Join via link)
    if (!invitation.sentViaEmail && invitation.allowedDomains.length) {
      const emailDomain = extractEmailDomain(email);
      const allowJoin = invitation.allowedDomains.find(
        (domain) => domain === emailDomain
      );

      if (!allowJoin) {
        throw new ApiError(
          400,
          'You must be logged in with an email address from an allowed domain.'
        );
      }
    }

    const teamMember = await addTeamMember(
      invitation.team.id,
      session.user.id as string,
      invitation.role
    );

    await sendEvent(invitation.team.id, 'member.created', teamMember);

    if (invitation.sentViaEmail) {
      await deleteInvitation({ token: inviteToken });
    }

    recordMetric('member.created');

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}

// Delete an invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const teamMember = await getTeamMemberForInvitations(slug);
    throwIfNotAllowed(teamMember, 'team_invitation', 'delete');

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    const { id: validatedId } = validateWithSchema(deleteInvitationSchema, {
      id: id || '',
    });

    const invitation = await getInvitation({ id: validatedId });

    if (
      invitation.invitedBy != teamMember.user.id ||
      invitation.team.id != teamMember.teamId
    ) {
      throw new ApiError(
        400,
        `You don't have permission to delete this invitation.`
      );
    }

    await deleteInvitation({ id: validatedId });

    sendAudit({
      action: 'member.invitation.delete',
      crud: 'd',
      user: teamMember.user,
      team: teamMember.team,
    });

    await sendEvent(teamMember.teamId, 'invitation.removed', invitation);

    recordMetric('invitation.removed');

    return NextResponse.json({ data: {} });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
