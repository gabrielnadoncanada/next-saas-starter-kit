'use client';

import { useJoinForm } from './hooks/useJoinForm';
import { JoinFormView } from './ui/JoinFormView';

interface JoinProps {
  recaptchaSiteKey: string | null;
}

export function Join({ recaptchaSiteKey }: JoinProps) {
  const {
    form,
    handleSubmit,
    isPending,
    isPasswordVisible,
    handlePasswordVisibility,
    recaptchaToken,
    setRecaptchaToken,
    recaptchaRef,
  } = useJoinForm({ recaptchaSiteKey });

  return (
    <JoinFormView
      form={form}
      onSubmit={handleSubmit}
      isPending={isPending}
      isPasswordVisible={isPasswordVisible}
      onPasswordVisibilityToggle={handlePasswordVisibility}
      recaptchaToken={recaptchaToken}
      onRecaptchaChange={setRecaptchaToken}
      recaptchaRef={recaptchaRef}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
}
