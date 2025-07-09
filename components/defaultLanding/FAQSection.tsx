import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

import faqs from './data/faq.json';

const FAQSection = () => {
  const t = useTranslations();
  return (
    <section className="py-6">
      <div className="flex flex-col justify-center space-y-6">
        <h2 className="text-center text-4xl font-bold normal-case">
          {t('frequently-asked')}
        </h2>
        <p className="text-center text-xl">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry.
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-1 gap-2">
            {faqs.map((faq, index) => {
              return (
                <Card key={index} className="border-none">
                  <CardContent className="items-left dark:border-gray-200 border border-gray-300">
                    <CardHeader>
                      <CardTitle>Q. {faq.question}</CardTitle>
                    </CardHeader>
                    <p>A. {faq.answer}</p>
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

export default FAQSection;
