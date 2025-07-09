import { z } from 'zod';

export const joinFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name should have at most 50 characters'),
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(8, 'Password must have at least 8 characters')
    .max(100, 'Password should have at most 100 characters'),
  team: z
    .string()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name should have at most 50 characters'),
});

export const joinWithInvitationSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name should have at most 100 characters'),
    password: z
      .string()
      .min(8, 'Password must have at least 8 characters')
      .max(100, 'Password should have at most 100 characters'),
    sentViaEmail: z.boolean(),
    email: z
      .string()
      .max(100, 'Email should have at most 100 characters')
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.sentViaEmail && (!data.email || data.email === '')) {
        return false;
      }
      if (
        !data.sentViaEmail &&
        data.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Email is required and must be valid when not sent via email',
      path: ['email'],
    }
  );

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must have at least 8 characters')
      .max(100, 'Password should have at most 100 characters'),
    confirmPassword: z
      .string()
      .max(100, 'Password should have at most 100 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type JoinFormData = z.infer<typeof joinFormSchema>;
export type JoinWithInvitationFormData = z.infer<
  typeof joinWithInvitationSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
