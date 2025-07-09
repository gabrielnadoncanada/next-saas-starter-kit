import { CheckIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';
import { Button } from '@/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

import plans from './data/pricing.json';

const PricingSection = () => {
  const t = useTranslations();
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('pricing')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {plans.map((plan, index) => {
              return (
                <Card
                  key={`plan-${index}`}
                  className="rounded-md dark:border-gray-200 border border-gray-300"
                >
                  <CardContent>
                    <CardHeader>
                      <CardTitle>
                        {plan.currency} {plan.amount} / {plan.duration}
                      </CardTitle>
                    </CardHeader>
                    <p>{plan.description}</p>
                    <div className="mt-5">
                      <ul className="flex flex-col space-y-2">
                        {plan.benefits.map(
                          (benefit: string, itemIndex: number) => {
                            return (
                              <li
                                key={`plan-${index}-benefit-${itemIndex}`}
                                className="flex items-center"
                              >
                                <CheckIcon className="h-5 w-5" />
                                <span className="ml-1">{benefit}</span>
                              </li>
                            );
                          }
                        )}
                      </ul>
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button className="md:w-full w-3/4 rounded-md">
                        {t('buy-now')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
