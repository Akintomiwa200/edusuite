import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React Compiler on Next 16 if needed
  reactCompiler: false,

  // Experimental features
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
    ppr: false,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'EduSuite',
    NEXT_PUBLIC_APP_VERSION: '3.0.0',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=()',
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },

  // Webpack customizations
  webpack: (config, { isServer }) => {
    // Handle mediasoup client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Output
  output: 'standalone',

  // Compression
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // Power by header
  poweredByHeader: false,
}

export default nextConfig
