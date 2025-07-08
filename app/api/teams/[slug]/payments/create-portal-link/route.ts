import { NextRequest, NextResponse } from 'next/server';
import { getTeamMember } from 'models/team';
import { stripe, getStripeCustomerId } from '@/lib/stripe';
import env from '@/lib/env';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForPortal(slug: string) {
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

// Create portal link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Check if payments feature is enabled
  if (!env.teamFeatures.payments) {
    return NextResponse.json(
      { error: { message: 'Payments feature is not enabled' } },
      { status: 404 }
    );
  }

  try {
    const teamMember = await getTeamMemberForPortal(slug);
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);
    const customerId = await getStripeCustomerId(teamMember, session);

    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.appUrl}/teams/${teamMember.team.slug}/billing`,
    });

    return NextResponse.json({ data: { url } });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
