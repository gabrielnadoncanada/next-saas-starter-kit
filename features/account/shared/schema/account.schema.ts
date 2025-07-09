import { z } from 'zod';

export const updateNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name should have at most 50 characters'),
});

export const updateEmailSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const deleteSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type UpdateNameFormData = z.infer<typeof updateNameSchema>;
export type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
export type DeleteSessionFormData = z.infer<typeof deleteSessionSchema>;
