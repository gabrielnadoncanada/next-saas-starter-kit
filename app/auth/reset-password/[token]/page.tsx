import { ResetPasswordForm } from '@/components/auth';
import { AuthLayout } from '@/components/layouts';

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;

  return (
    <AuthLayout heading="Reset Password" description="Enter your new password">
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
