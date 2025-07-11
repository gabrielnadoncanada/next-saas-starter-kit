'use server';

import { getCurrentUser } from '@/lib/data-fetchers';
import { getTeamMember } from '@/features/team/shared/model/team';
import { stripe, getStripeCustomerId } from '@/lib/stripe';
import env from '@/lib/env';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';

export async function createPortalLinkAction(teamSlug: string) {
  try {
    // Check if payments feature is enabled
    if (!env.teamFeatures.payments) {
      throw new Error('Payments feature is not enabled');
    }

    const user = await getCurrentUser();
    const teamMember = await getTeamMember(user.id, teamSlug);

    if (!teamMember) {
      throw new Error('You do not have access to this team');
    }

    // Get Stripe customer ID
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);
    const customerId = await getStripeCustomerId(teamMember, session);

    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Create portal session
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.appUrl}/teams/${teamMember.team.slug}/billing`,
    });

    return {
      success: true,
      data: { url },
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create portal link',
    };
  }
}
