import { NextRequest, NextResponse } from 'next/server';
import { getStripeCustomerId } from '@/lib/stripe';
import { getTeamMember } from 'models/team';
import { getAllServices } from 'models/service';
import { getAllPrices } from 'models/price';
import { getByCustomerId } from 'models/subscription';
import { getServerSession } from 'next-auth/next';
import { getAuthOptions } from '@/lib/nextAuth';
import env from '@/lib/env';

// Helper function to get team member for app router
async function getTeamMemberForPayments(slug: string) {
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

// Get products and subscriptions
export async function GET(
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
    const authOptions = getAuthOptions({} as any, {} as any);
    const session = await getServerSession(authOptions);
    const teamMember = await getTeamMemberForPayments(params.slug);

    if (!session?.user?.id) {
      throw Error('Could not get user');
    }

    const customerId = await getStripeCustomerId(teamMember, session);

    const [subscriptions, products, prices] = await Promise.all([
      getByCustomerId(customerId),
      getAllServices(),
      getAllPrices(),
    ]);

    // create a unified object with prices associated with the product
    const productsWithPrices = products.map((product: any) => {
      product.prices = prices.filter((price) => price.serviceId === product.id);
      return product;
    });

    // Subscriptions with product and price
    const _subscriptions: any[] = subscriptions.map((subscription: any) => {
      const _price = prices.find((p) => p.id === subscription.priceId);
      if (!_price) {
        return undefined;
      }
      const subscriptionProduct = products.find(
        (p) => p.id === _price.serviceId
      );

      return {
        ...subscription,
        product: subscriptionProduct,
        price: _price,
      };
    });

    return NextResponse.json({
      data: {
        products: productsWithPrices,
        subscriptions: (_subscriptions || []).filter((s) => !!s),
      },
    });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
