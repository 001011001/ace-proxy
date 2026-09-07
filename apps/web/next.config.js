/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // Disable Next.js 13 error overlay (known bug workaround)
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/arbibot/:path*',
        destination: 'http://localhost:3001/arbibot/:path*',
      },
    ];
  },
}

module.exports = nextConfig
