export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sku: string;
          batchNumber: string;
          manufactureDate: Date;
          expiryDate: Date;
          imageUrl: string | null;
          companyName: string;
          companyAddress: string | null;
          verified: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sku: string;
          batchNumber: string;
          manufactureDate: Date;
          expiryDate: Date;
          imageUrl?: string | null;
          companyName: string;
          companyAddress?: string | null;
          verified?: boolean;
          createdAt?: Date;
          updatedAt?: Date;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sku?: string;
          batchNumber?: string;
          manufactureDate?: Date;
          expiryDate?: Date;
          imageUrl?: string | null;
          companyName?: string;
          companyAddress?: string | null;
          verified?: boolean;
          createdAt?: Date;
          updatedAt?: Date;
        };
      };
      barcodes: {
        Row: {
          id: string;
          code: string;
          productId: string;
          scanCount: number;
          lastScannedAt: Date | null;
          createdAt: Date;
        };
        Insert: {
          id?: string;
          code: string;
          productId: string;
          scanCount?: number;
          lastScannedAt?: Date | null;
          createdAt?: Date;
        };
        Update: {
          id?: string;
          code?: string;
          productId?: string;
          scanCount?: number;
          lastScannedAt?: Date | null;
          createdAt?: Date;
        };
      };
      scan_logs: {
        Row: {
          id: string;
          barcode: string;
          ipAddress: string | null;
          userAgent: string | null;
          scannedAt: Date;
        };
        Insert: {
          id?: string;
          barcode: string;
          ipAddress?: string | null;
          userAgent?: string | null;
          scannedAt?: Date;
        };
        Update: {
          id?: string;
          barcode?: string;
          ipAddress?: string | null;
          userAgent?: string | null;
          scannedAt?: Date;
        };
      };
    };
    Views: {
      [_ in string]: {
        Row: Record<string, Json>;
      };
    };
    Functions: {
      [_ in string]: {
        Args: Record<string, unknown>;
        Returns: Json;
      };
    };
  };
}
