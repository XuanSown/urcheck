import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Public client (safe to expose in browser via NEXT_PUBLIC_ env vars)
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient<Database>);

// Admin client (server-side only) - uses SERVICE_ROLE key for elevated privileges
// Used for: storage uploads, bypassing RLS, admin operations
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: SupabaseClient<Database> | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export const isSupabaseAdminConfigured = (): boolean => {
  return supabaseAdmin !== null;
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Ensure the product-images storage bucket exists and is public so uploaded
// images are readable via getPublicUrl(). Safe to call on every upload.
export async function ensureProductImagesBucket(): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    const { data } = await supabaseAdmin.storage.getBucket('product-images');
    if (!data) {
      await supabaseAdmin.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 10485760,
      });
    } else if (!data.public) {
      await supabaseAdmin.storage.updateBucket('product-images', { public: true });
    }
  } catch (e) {
    console.warn('ensureProductImagesBucket failed:', e);
  }
}
