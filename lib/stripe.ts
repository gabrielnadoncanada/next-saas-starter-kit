import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from '@/features/team/shared/model/team';

export const stripe = env.stripe.secretKey
  ? new Stripe(env.stripe.secretKey)
  : null;

export async function getStripeCustomerId(teamMember, session?: any) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  let customerId = '';
  if (!teamMember.team.billingId) {
    const customerData: {
      metadata: { teamId: string };
      email?: string;
    } = {
      metadata: {
        teamId: teamMember.teamId,
      },
    };
    if (session?.user?.email) {
      customerData.email = session?.user?.email;
    }
    const customer = await stripe.customers.create({
      ...customerData,
      name: session?.user?.name as string,
    });
    await updateTeam(teamMember.team.slug, {
      billingId: customer.id,
      billingProvider: 'stripe',
    });
    customerId = customer.id;
  } else {
    customerId = teamMember.team.billingId;
  }
  return customerId;
}
