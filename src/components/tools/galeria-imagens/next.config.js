import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-storage-domain.supabase.co'],
  },
}

export default nextConfig