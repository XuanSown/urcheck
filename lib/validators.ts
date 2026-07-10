import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(255),
  description: z.string().optional(),
  manufactureDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  expiresInMonths: z.number().int().positive().optional().nullable(),
  skinType: z.string().optional(),
  suitableFor: z.string().optional(),
  usages: z.array(z.string()).max(10).optional().default([]),
  usageInstructions: z.array(z.string()).max(10).optional().default([]),
  ingredientAnalysis: z.string().optional(),
  tags: z.array(z.string()).max(20).optional().default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  purchaseLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
    })
  ).max(5).optional().default([]),
  brandName: z.string().min(1, 'Tên thương hiệu là bắt buộc').max(255),
  verified: z.boolean().optional().default(true),
  batchNumber: z.string().max(100).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  certifications: z.array(z.string().max(100)).max(20).optional().default([]),
}).refine(
  (data) => {
    if (data.expiresInMonths && data.expiresInMonths > 0) {
      return true;
    }
    if (data.manufactureDate && data.expiryDate) {
      const mDate = new Date(data.manufactureDate);
      const eDate = new Date(data.expiryDate);
      return !isNaN(mDate.getTime()) && !isNaN(eDate.getTime()) && eDate > mDate;
    }
    return false;
  },
  {
    message: 'Vui lòng nhập ngày sản xuất và ngày hết hạn hợp lệ, hoặc nhập số tháng hết hạn (lớn hơn 0)',
    path: ['expiryDate'],
  }
);

export type ProductFormData = z.infer<typeof productSchema>;
