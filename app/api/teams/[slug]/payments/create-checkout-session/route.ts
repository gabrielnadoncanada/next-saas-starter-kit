import { NextRequest, NextResponse } from 'next/server';
import { getTeamMember } from 'models/team';
import { stripe, getStripeCustomerId } from '@/lib/stripe';
import env from '@/lib/env';
import { checkoutSessionSchema, validateWithSchema } from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

// Helper function to get team member for app router
async function getTeamMemberForCheckout(slug: string) {
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

// Create checkout session
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;

  // Check if payments feature is enabled
  if (!env.teamFeatures.payments) {
    return NextResponse.json(
      { error: { message: 'Payments feature is not enabled' } },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { price, quantity } = validateWithSchema(checkoutSessionSchema, body);

    const teamMember = await getTeamMemberForCheckout(params.slug);
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);
    const customer = await getStripeCustomerId(teamMember, session);

    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer,
      mode: 'subscription',
      line_items: [
        {
          price,
          quantity,
        },
      ],

      // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
      // the actual Session ID is returned in the query parameter when your customer
      // is redirected to the success page.

      success_url: `${env.appUrl}/teams/${teamMember.team.slug}/billing`,
      cancel_url: `${env.appUrl}/teams/${teamMember.team.slug}/billing`,
    });

    return NextResponse.json({ data: checkoutSession });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
