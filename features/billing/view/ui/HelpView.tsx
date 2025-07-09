import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/shared';

export function HelpView() {
  const t = useTranslations();

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('need-anything-else')}</Card.Title>
          <Card.Description>{t('billing-assistance-message')}</Card.Description>
        </Card.Header>
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
      </Card.Body>
    </Card>
  );
}
