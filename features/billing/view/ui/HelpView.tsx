import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

export function HelpView() {
  const t = useTranslations();

  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>{t('need-anything-else')}</CardTitle>
          <CardDescription>{t('billing-assistance-message')}</CardDescription>
        </CardHeader>
        <div>
          <Link
            href={process.env.NEXT_PUBLIC_SUPPORT_URL || ''}
            className="btn btn-primary btn-outline btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('contact-support')}
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
