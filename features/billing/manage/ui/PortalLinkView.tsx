import { Button } from '@/lib/components/ui/button';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

interface PortalLinkViewProps {
  loading: boolean;
  onOpenPortal: () => void;
}

export function PortalLinkView({ loading, onOpenPortal }: PortalLinkViewProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardContent>
        <CardHeader>
          <CardTitle>{t('manage-subscription')}</CardTitle>
          <CardDescription>{t('manage-billing-information')}</CardDescription>
        </CardHeader>
        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={onOpenPortal}
          >
            {t('billing-portal')}
            <ArrowTopRightOnSquareIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
