'use client';

import { useTransition, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  joinWithInvitationSchema,
  type JoinWithInvitationFormData,
} from '@/features/auth/shared/schema/signup.schema';
import { joinWithInvitationAction } from '../actions/joinWithInvitation.action';
import useInvitation from 'hooks/useInvitation';
import type ReCAPTCHA from 'react-google-recaptcha';

interface UseJoinWithInvitationFormProps {
  inviteToken: string;
  recaptchaSiteKey: string | null;
}

export function useJoinWithInvitationForm({
  inviteToken,
  recaptchaSiteKey,
}: UseJoinWithInvitationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { isLoading, error, invitation } = useInvitation(inviteToken);

  const form = useForm<JoinWithInvitationFormData>({
    resolver: zodResolver(joinWithInvitationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      sentViaEmail: invitation?.sentViaEmail || true,
    },
    mode: 'onChange',
  });

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.email) formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('sentViaEmail', values.sentViaEmail.toString());
      formData.append('recaptchaToken', recaptchaToken);

      const result = await joinWithInvitationAction(inviteToken, formData);

      recaptchaRef.current?.reset();

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      form.reset();
      toast.success('Account created successfully');
    });
  });

  return {
    form,
    handleSubmit,
    isPending,
    isPasswordVisible,
    handlePasswordVisibility,
    recaptchaToken,
    setRecaptchaToken,
    recaptchaRef,
    recaptchaSiteKey,
    // Invitation data
    isLoading,
    isError: error,
    invitation,
  };
}
