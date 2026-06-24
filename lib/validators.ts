import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(255),
  description: z.string().optional(),
  sku: z.string().min(1, 'Mã SKU là bắt buộc').max(100),
  batchNumber: z.string().min(1, 'Số lô là bắt buộc').max(100),
  manufactureDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Ngày sản xuất không hợp lệ' }
  ),
  expiryDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Ngày hết hạn không hợp lệ' }
  ).refine(
    (val) => new Date(val) > new Date(),
    { message: 'Ngày hết hạn phải sau ngày hiện tại' }
  ),
  skinType: z.string().optional(),
  suitableFor: z.string().optional(),
  pros: z.array(z.string()).max(10).optional().default([]),
  cons: z.array(z.string()).max(10).optional().default([]),
  ingredientAnalysis: z.string().optional(),
  tags: z.array(z.string()).max(20).optional().default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  purchaseLinks: z.array(
    z.object({
      platform: z.string().min(1),
      url: z.string().url('URL không hợp lệ'),
    })
  ).max(2).optional().default([]),
  companyName: z.string().min(1, 'Tên công ty là bắt buộc').max(255),
  companyAddress: z.string().optional(),
  verified: z.boolean().optional().default(true),
  barcodes: z.array(z.string()).max(10).optional().default([]),
}).refine(
  (data) => {
    const manufactureDate = new Date(data.manufactureDate);
    const expiryDate = new Date(data.expiryDate);
    return expiryDate > manufactureDate;
  },
  {
    message: 'Ngày hết hạn phải sau ngày sản xuất',
    path: ['expiryDate'],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;

export const barcodeScanSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
});

export const verifySchema = barcodeScanSchema;

export type VerifyInput = z.infer<typeof verifySchema>;
