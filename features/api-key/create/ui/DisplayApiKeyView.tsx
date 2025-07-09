'use client';

import { InputWithCopyButton } from '@/components/shared';
import { Button } from '@/lib/components/ui/button';
import { useTranslations } from 'next-intl';

interface DisplayApiKeyViewProps {
  apiKey: string;
  onClose: () => void;
}

export function DisplayApiKeyView({ apiKey, onClose }: DisplayApiKeyViewProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{t('new-api-key')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('new-api-warning')}
        </p>
      </div>

      <InputWithCopyButton
        label={t('api-key')}
        value={apiKey}
        className="text-sm"
        readOnly
      />

      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  );
}
