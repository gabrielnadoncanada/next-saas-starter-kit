import { Button } from 'react-daisyui';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/shared';

interface PortalLinkViewProps {
  loading: boolean;
  onOpenPortal: () => void;
}

export function PortalLinkView({ loading, onOpenPortal }: PortalLinkViewProps) {
  const t = useTranslations();

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('manage-subscription')}</Card.Title>
          <Card.Description>{t('manage-billing-information')}</Card.Description>
        </Card.Header>
        <div>
          <Button
            type="button"
            color="primary"
            size="sm"
            variant="outline"
            loading={loading}
            onClick={onOpenPortal}
          >
            {t('billing-portal')}
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
