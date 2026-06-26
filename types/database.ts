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
      scan_logs: {
        Row: {
          id: string;
          qrCode: string;
          ipAddress: string | null;
          userAgent: string | null;
          scannedAt: Date;
        };
        Insert: {
          id?: string;
          qrCode: string;
          ipAddress?: string | null;
          userAgent?: string | null;
          scannedAt?: Date;
        };
        Update: {
          id?: string;
          qrCode?: string;
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
