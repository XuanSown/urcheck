export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  batchNumber: string;
  manufactureDate: string | Date;
  expiryDate: string | Date;
  imageUrl?: string;
  companyName: string;
  companyAddress?: string;
  verified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface QrCode {
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
  qrCode: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
