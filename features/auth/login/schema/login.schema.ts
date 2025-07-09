import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
