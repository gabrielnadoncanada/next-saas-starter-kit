import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { permissions } from '@/lib/permissions';

// Get current user session or redirect to login
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  return session.user;
}

// Get all teams for current user
export async function getUserTeams() {
  const user = await getCurrentUser();

  const teams = await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return teams;
}

// Get team by slug with access check
export async function getTeamBySlug(slug: string) {
  const user = await getCurrentUser();

  const team = await prisma.team.findFirst({
    where: {
      slug,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  });

  if (!team) {
    redirect('/teams');
  }

  return team;
}

// Get team with members
export async function getTeamWithMembers(slug: string) {
  const user = await getCurrentUser();

  const team = await prisma.team.findFirst({
    where: {
      slug,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!team) {
    redirect('/teams');
  }

  return {
    team: {
      id: team.id,
      name: team.name,
      slug: team.slug,
      domain: team.domain,
      defaultRole: team.defaultRole,
      billingId: team.billingId,
      billingProvider: team.billingProvider,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    },
    members: team.members,
  };
}

// Get team with API keys
export async function getTeamWithApiKeys(slug: string) {
  const user = await getCurrentUser();

  const team = await prisma.team.findFirst({
    where: {
      slug,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      apiKeys: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!team) {
    redirect('/teams');
  }

  return {
    team: {
      id: team.id,
      name: team.name,
      slug: team.slug,
      domain: team.domain,
      defaultRole: team.defaultRole,
      billingId: team.billingId,
      billingProvider: team.billingProvider,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    },
    apiKeys: team.apiKeys,
  };
}

// Get team with user role and permissions
export async function getTeamWithPermissions(slug: string) {
  const user = await getCurrentUser();

  const teamWithMember = await prisma.team.findFirst({
    where: {
      slug,
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      members: {
        where: {
          userId: user.id,
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!teamWithMember) {
    redirect('/teams');
  }

  const userRole = teamWithMember.members[0]?.role;
  const userPermissions = userRole ? permissions[userRole] : [];

  return {
    team: {
      id: teamWithMember.id,
      name: teamWithMember.name,
      slug: teamWithMember.slug,
      domain: teamWithMember.domain,
      defaultRole: teamWithMember.defaultRole,
      billingId: teamWithMember.billingId,
      billingProvider: teamWithMember.billingProvider,
      createdAt: teamWithMember.createdAt,
      updatedAt: teamWithMember.updatedAt,
    },
    permissions: userPermissions,
    userRole,
  };
}

// Get team with billing data
export async function getTeamWithBilling(slug: string) {
  const user = await getCurrentUser();
  const team = await getTeamBySlug(slug);

  // This would typically fetch from Stripe or billing provider
  // For now, return team data - billing logic would be added here
  return {
    team,
    products: [],
    subscriptions: [],
  };
}
