'use server';

import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeamMember } from '@/features/team/shared/model/team';
import { stripe, getStripeCustomerId } from '@/lib/stripe';
import env from '@/lib/env';
import { checkoutSessionSchema } from '@/lib/zod';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

export async function createCheckoutSessionAction(
  teamSlug: string,
  price: string,
  quantity?: number
) {
  try {
    // Check if payments feature is enabled
    if (!env.teamFeatures.payments) {
      throw new Error('Payments feature is not enabled');
    }

    // Validate input
    checkoutSessionSchema.parse({ price, quantity });

    const user = await getCurrentUser();
    const teamMember = await getTeamMember(user.id, teamSlug);

    if (!teamMember) {
      throw new Error('You do not have access to this team');
    }

    // Get Stripe customer ID
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);
    const customer = await getStripeCustomerId(teamMember, session);

    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer,
      mode: 'subscription',
      line_items: [
        {
          price,
          quantity,
        },
      ],
      success_url: `${env.appUrl}/teams/${teamMember.team.slug}/billing`,
      cancel_url: `${env.appUrl}/teams/${teamMember.team.slug}/billing`,
    });

    return {
      success: true,
      data: { url: checkoutSession.url },
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create checkout session',
    };
  }
}
