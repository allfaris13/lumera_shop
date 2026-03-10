/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "example.com",
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: `http://localhost:5000/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `http://localhost:5000/uploads/:path*`,
        },
      ]
    };
  },
  // Turbopack configuration for Next.js 16
  turbopack: {
    // Empty config to silence the warning
  },
  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
