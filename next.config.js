/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Disable static optimization for API routes
    serverComponentsExternalPackages: ['mongoose']
  },
}

module.exports = nextConfig 