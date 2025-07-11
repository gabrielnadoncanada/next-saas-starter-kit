import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import env from '@/lib/env';
import {
  createStripeSubscription,
  deleteStripeSubscription,
  getBySubscriptionId,
  updateStripeSubscription,
} from '@/features/billing/shared/model/subscription';
import { getByCustomerId } from '@/features/team/shared/model/team';

const relevantEvents: Stripe.Event.Type[] = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const sig = request.headers.get('stripe-signature');
  const { webhookSecret } = env.stripe;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret || !stripe) {
      return new NextResponse(null, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 400 }
    );
  }

  if (relevantEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await deleteStripeSubscription(
            (event.data.object as Stripe.Subscription).id
          );
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return NextResponse.json(
        {
          error: {
            message: 'Webhook handler failed. View your nextjs function logs.',
          },
        },
        { status: 400 }
      );
    }
  }
  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const {
    cancel_at,
    id,
    status,
    current_period_end,
    current_period_start,
    customer,
    items,
  } = event.data.object as Stripe.Subscription;

  const subscription = await getBySubscriptionId(id);
  if (!subscription) {
    const teamExists = await getByCustomerId(customer as string);
    if (!teamExists) {
      return;
    } else {
      await handleSubscriptionCreated(event);
    }
  } else {
    const priceId = items.data.length > 0 ? items.data[0].plan?.id : '';
    //type Stripe.Subscription.Status = "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid"
    await updateStripeSubscription(id, {
      active: status === 'active',
      endDate: current_period_end
        ? new Date(current_period_end * 1000)
        : undefined,
      startDate: current_period_start
        ? new Date(current_period_start * 1000)
        : undefined,
      cancelAt: cancel_at ? new Date(cancel_at * 1000) : undefined,
      priceId,
    });
  }
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const { customer, id, current_period_start, current_period_end, items } =
    event.data.object as Stripe.Subscription;

  await createStripeSubscription({
    customerId: customer as string,
    id,

    active: true,
    startDate: new Date(current_period_start * 1000),
    endDate: new Date(current_period_end * 1000),
    priceId: items.data.length > 0 ? items.data[0].plan?.id : '',
  });
}
