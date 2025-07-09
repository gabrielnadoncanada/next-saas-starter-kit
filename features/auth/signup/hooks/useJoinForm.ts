'use client';

import { useTransition, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  joinFormSchema,
  type JoinFormData,
} from '@/features/auth/shared/schema/signup.schema';
import { joinAction } from '../actions/join.action';
import type ReCAPTCHA from 'react-google-recaptcha';

interface UseJoinFormProps {
  recaptchaSiteKey: string | null;
}

export function useJoinForm({ recaptchaSiteKey }: UseJoinFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<JoinFormData>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      team: '',
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
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('team', values.team);
      formData.append('recaptchaToken', recaptchaToken);

      const result = await joinAction(formData);

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
  };
}
