import { z } from 'zod';

export const verifySchema = z.object({
  qrCode: z.string().min(1, 'QR code is required').max(500),
});

export const uploadSchema = z.object({
  productId: z.string().cuid(),
});

export type VerifyInput = z.infer<typeof verifySchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
