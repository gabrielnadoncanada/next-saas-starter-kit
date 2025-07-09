import { z } from 'zod';

export const inviteViaEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['MEMBER', 'ADMIN', 'OWNER'], {
    required_error: 'Please select a role',
  }),
});

export const deleteInvitationSchema = z.object({
  invitationId: z.string().min(1, 'Invitation ID is required'),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type InviteViaEmailFormData = z.infer<typeof inviteViaEmailSchema>;
export type DeleteInvitationFormData = z.infer<typeof deleteInvitationSchema>;
export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;
