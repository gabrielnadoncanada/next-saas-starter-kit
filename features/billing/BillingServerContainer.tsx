import { TeamTab } from '@/features/team';
import { HelpView } from './view/ui/HelpView';
import { PortalLink } from './manage/PortalLink';
import { SubscriptionsView } from './view/ui/SubscriptionsView';
import { ProductPricing } from './subscribe/ProductPricing';
import { BillingAccessWrapper } from './view/ui/BillingAccessWrapper';
import type { TeamFeature } from 'types';

interface BillingServerContainerProps {
  team: any;
  products: any[];
  subscriptions: any[];
  teamFeatures: TeamFeature;
}

export function BillingServerContainer({
  team,
  products,
  subscriptions,
  teamFeatures,
}: BillingServerContainerProps) {
  return (
    <BillingAccessWrapper>
      <TeamTab activeTab="payments" team={team} teamFeatures={teamFeatures} />

      <div className="flex gap-6 flex-col md:flex-row">
        <PortalLink teamSlug={team.slug} />
        <HelpView />
      </div>

      <div className="py-6">
        <SubscriptionsView subscriptions={subscriptions} />
      </div>

      <ProductPricing plans={products} subscriptions={subscriptions} />
    </BillingAccessWrapper>
  );
}
