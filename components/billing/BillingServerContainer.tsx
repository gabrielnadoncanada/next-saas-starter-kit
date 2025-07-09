import { TeamTab } from '@/features/team';
import Help from './Help';
import LinkToPortal from './LinkToPortal';
import Subscriptions from './Subscriptions';
import ProductPricing from './ProductPricing';
import { BillingAccessWrapper } from './BillingAccessWrapper';
import type { TeamFeature } from 'types';

interface BillingServerContainerProps {
  team: any;
  products: any[];
  subscriptions: any[];
  teamFeatures: TeamFeature;
}

const BillingServerContainer = ({
  team,
  products,
  subscriptions,
  teamFeatures,
}: BillingServerContainerProps) => {
  return (
    <BillingAccessWrapper>
      <TeamTab activeTab="payments" team={team} teamFeatures={teamFeatures} />

      <div className="flex gap-6 flex-col md:flex-row">
        <LinkToPortal team={team} />
        <Help />
      </div>

      <div className="py-6">
        <Subscriptions subscriptions={subscriptions} />
      </div>

      <ProductPricing plans={products} subscriptions={subscriptions} />
    </BillingAccessWrapper>
  );
};

export default BillingServerContainer;
