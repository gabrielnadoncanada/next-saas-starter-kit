import { useTranslations } from 'next-intl';

import { Alert, AlertDescription } from '@/lib/components/ui/alert';

interface ErrorProps {
  message?: string;
}

const Error = (props: ErrorProps) => {
  const { message } = props;
  const t = useTranslations();

  return (
    <Alert variant="destructive" className="my-2">
      <AlertDescription>
        <p>{message || t('unknown-error')}</p>
      </AlertDescription>
    </Alert>
  );
};

export default Error;
