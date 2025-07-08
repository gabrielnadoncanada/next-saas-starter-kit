import { useTranslations } from 'next-intl';

import Alert from './Alert';

interface ErrorProps {
  message?: string;
}

const Error = (props: ErrorProps) => {
  const { message } = props;
  const t = useTranslations();

  return (
    <Alert status="error" className="my-2">
      <p>{message || t('unknown-error')}</p>
    </Alert>
  );
};

export default Error;
