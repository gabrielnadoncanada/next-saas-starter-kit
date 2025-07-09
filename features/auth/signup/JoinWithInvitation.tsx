'use client';

import { useJoinWithInvitationForm } from './hooks/useJoinWithInvitationForm';
import { JoinWithInvitationFormView } from './ui/JoinWithInvitationFormView';

interface JoinWithInvitationProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

export function JoinWithInvitation({
  inviteToken,
  recaptchaSiteKey,
}: JoinWithInvitationProps) {
  const {
    form,
    handleSubmit,
    isPending,
    isPasswordVisible,
    handlePasswordVisibility,
    recaptchaToken,
    setRecaptchaToken,
    recaptchaRef,
    isLoading,
    isError,
    invitation,
  } = useJoinWithInvitationForm({ inviteToken, recaptchaSiteKey });

  return (
    <JoinWithInvitationFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
      isPasswordVisible={isPasswordVisible}
      onPasswordVisibilityToggle={handlePasswordVisibility}
      recaptchaToken={recaptchaToken}
      onRecaptchaChange={setRecaptchaToken}
      recaptchaRef={recaptchaRef}
      recaptchaSiteKey={recaptchaSiteKey}
      isLoading={isLoading}
      isError={isError}
      invitation={invitation || null}
    />
  );
}
