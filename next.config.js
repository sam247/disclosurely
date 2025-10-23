/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },

  // Redirects configuration
  async redirects() {
    return [
      {
        // Redirect www to non-www (301 permanent redirect)
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'host',
            value: 'www.disclosurely.com',
          },
        ],
        destination: 'https://disclosurely.com/:path*',
        permanent: true,
      },
    ];
  },

  // Headers configuration for additional SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
