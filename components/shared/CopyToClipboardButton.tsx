'use client';

import { copyToClipboard } from '@/lib/common';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { Button } from '@/lib/components/ui/button';
import { toast } from 'react-hot-toast';

interface CopyToClipboardProps {
  value: string;
}

const CopyToClipboardButton = ({ value }: CopyToClipboardProps) => {
  const t = useTranslations();

  const handleCopy = () => {
    copyToClipboard(value);
    toast.success(t('copied-to-clipboard'));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-2 h-auto"
      title={t('copy-to-clipboard')}
      onClick={handleCopy}
    >
      <ClipboardDocumentIcon className="w-5 h-5 text-muted-foreground" />
    </Button>
  );
};

export default CopyToClipboardButton;
