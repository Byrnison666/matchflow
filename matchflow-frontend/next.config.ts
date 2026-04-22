import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.matchflow.app' }],
  },
  experimental: { typedRoutes: true },
}

export default nextConfig
