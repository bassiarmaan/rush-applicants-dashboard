/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13.4+
  
  // Disable static optimization for API routes to ensure fresh data
  experimental: {
    serverComponentsExternalPackages: []
  },
  
  // Configure headers for better cache control
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
