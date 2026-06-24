export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  batchNumber: string;
  manufactureDate: string | Date;
  expiryDate: string | Date;
  skinType?: string;
  suitableFor?: string;
  pros: string[];
  cons: string[];
  ingredientAnalysis?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | Date;
  purchaseLinks?: Array<{ platform: string; url: string }>;
  companyName: string;
  companyAddress?: string;
  imageUrl?: string | null;
  verified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string | Date;
}

export interface ProductVersion {
  id: string;
  productId: string;
  productSnapshot: unknown;
  imageSnapshot?: unknown[];
  changedBy: string;
  changeReason?: string;
  createdAt: string | Date;
}

export interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  skinType?: string;
  suitableFor?: string;
  pros: string[];
  cons: string[];
  ingredientAnalysis?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  purchaseLinks?: Array<{ platform: string; url: string }>;
  companyName: string;
  companyAddress?: string;
  verified: boolean;
}

export interface Barcode {
  id: string;
  code: string;
  productId: string;
  scanCount: number;
  lastScannedAt?: string | Date;
  createdAt: string | Date;
}

export interface VerificationResult {
  valid: boolean;
  product?: Product;
  message?: string;
}

export interface ScanRequest {
  barcode: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: 'ADMIN' | 'CUSTOMER';
  isActive: boolean;
  lastLogin?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminSession {
  userId: string;
  username: string;
  role: string;
  expires: number;
}
