import env from '@/lib/env';
import { ssoManager } from '@/lib/jackson/sso';
import { ssoVerifySchema, validateWithSchema } from '@/lib/zod';
import type { Team } from '@prisma/client';
import { getTeam, getTeams } from 'models/team';
import { getUser } from 'models/user';
import { NextRequest, NextResponse } from 'next/server';

const sso = ssoManager();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email } = validateWithSchema(ssoVerifySchema, body);

    if (!slug && !email) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // If slug is provided, verify SSO connections for the team
    if (slug) {
      const team = await getTeam({ slug });

      if (!team) {
        throw new Error('Team not found.');
      }

      const data = await handleTeamSSOVerification(team.id);
      return NextResponse.json({ data });
    }

    // If email is provided, verify SSO connections for the user
    if (email) {
      const teams = await getTeamsFromEmail(email);

      if (teams.length === 1) {
        const data = await handleTeamSSOVerification(teams[0].id);
        return NextResponse.json({ data });
      }

      const { teamId, useSlug } = await processTeamsForSSOVerification(teams);

      // Multiple teams with SSO connections found
      // Ask user to provide team slug
      if (useSlug) {
        return NextResponse.json({
          data: {
            useSlug,
          },
        });
      }

      // No teams with SSO connections found
      if (!teamId) {
        throw new Error('No SSO connections found for any team.');
      } else {
        // Only one team with SSO connections found
        return NextResponse.json({
          data: {
            teamId,
          },
        });
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: { message: err.message },
      },
      { status: 400 }
    );
  }
}

/**
 * Handle SSO verification for given team id
 */
async function handleTeamSSOVerification(teamId: string) {
  const exists = await teamSSOExists(teamId);

  if (!exists) {
    throw new Error('No SSO connections found for this team.');
  }

  return { teamId };
}

/**
 * Get list of teams for a user from email
 */
async function getTeamsFromEmail(email: string): Promise<Team[]> {
  const user = await getUser({ email });
  if (!user) {
    throw new Error('User not found.');
  }
  const teams = await getTeams(user.id);
  if (!teams.length) {
    throw new Error('User does not belong to any team.');
  }
  return teams;
}

/**
 * Check if SSO connections exist for a team
 */
async function teamSSOExists(teamId: string): Promise<boolean> {
  const connections = await sso.getConnections({
    tenant: teamId,
    product: env.jackson.productId,
  });

  if (connections && connections.length > 0) {
    return true;
  }

  return false;
}

/**
 * Process teams to find the team with SSO connections
 * If multiple teams with SSO connections are found, return useSlug as true
 * If no teams with SSO connections are found, return teamId as empty string
 * If only one team with SSO connections is found, return teamId
 */
async function processTeamsForSSOVerification(teams: Team[]): Promise<{
  teamId: string;
  useSlug: boolean;
}> {
  let teamId = '';
  for (const team of teams) {
    const exists = await teamSSOExists(team.id);

    if (exists) {
      if (teamId) {
        // Multiple teams with SSO connections found
        return {
          teamId: '',
          useSlug: true,
        };
      } else {
        // First team with SSO connections found
        teamId = team.id;
      }
    }
  }
  return {
    teamId,
    useSlug: false,
  };
}
