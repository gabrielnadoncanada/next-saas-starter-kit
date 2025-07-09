import { Loading } from '@/components/shared';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

interface WithLoadingAndErrorProps {
  isLoading: boolean;
  error: any;
  children: React.ReactNode;
}

const WithLoadingAndError = (props: WithLoadingAndErrorProps) => {
  const { isLoading, error, children } = props;

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default WithLoadingAndError;
