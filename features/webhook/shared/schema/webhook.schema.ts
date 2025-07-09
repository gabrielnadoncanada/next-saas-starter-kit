import { z } from 'zod';

export const webhookEndpointSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  url: z
    .string()
    .url('Must be a valid URL')
    .refine((url) => url.startsWith('https://'), {
      message: 'URL must use HTTPS',
    }),
  eventTypes: z
    .array(z.string())
    .min(1, 'At least one event type must be selected'),
});

export const updateWebhookEndpointSchema = webhookEndpointSchema.extend({
  endpointId: z.string().min(1, 'Endpoint ID is required'),
});

export const deleteWebhookSchema = z.object({
  webhookId: z.string().min(1, 'Webhook ID is required'),
});

export type WebhookFormData = z.infer<typeof webhookEndpointSchema>;
export type UpdateWebhookFormData = z.infer<typeof updateWebhookEndpointSchema>;
export type DeleteWebhookFormData = z.infer<typeof deleteWebhookSchema>;
