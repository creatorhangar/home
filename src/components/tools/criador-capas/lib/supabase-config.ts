import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage configuration
export const storageConfig = {
  bucketName: 'galeria-uploads',
  publicUrl: `${supabaseUrl}/storage/v1/object/public/galeria-uploads/`,
  
  // Image transformation presets
  imagePresets: {
    thumbnail: { width: 400, format: 'webp' },
    medium: { width: 800, format: 'webp' },
    large: { width: 1200, format: 'webp' }
  }
}

// Upload configuration
export const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxFiles: 50
}

// RLS Policies template
export const rlsPolicies = {
  images: {
    select: 'true', // Public read
    insert: 'auth.jwt() ->> \'role\' = \'admin\'', // Admin only
    update: 'auth.jwt() ->> \'role\' = \'admin\'', // Admin only
    delete: 'auth.jwt() ->> \'role\' = \'admin\'' // Admin only
  },
  categories: {
    select: 'true', // Public read
    insert: 'auth.jwt() ->> \'role\' = \'admin\'', // Admin only
    update: 'auth.jwt() ->> \'role\' = \'admin\'', // Admin only
    delete: 'auth.jwt() ->> \'role\' = \'admin\'' // Admin only
  },
  tags: {
    select: 'true', // Public read
    insert: 'auth.jwt() ->> \'role\' = \'admin\'', // Admin only
    update: 'auth.jwt() ->> \'role\' = \'admin\'', // Admin only
    delete: 'auth.jwt() ->> \'role\' = \'admin\'' // Admin only
  }
}