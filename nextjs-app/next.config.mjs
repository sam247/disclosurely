const dashboardOrigin =
  process.env.NEXT_PUBLIC_DASHBOARD_ORIGIN ??
  "https://disclosurely-dashboard.vercel.app";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-slot",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog"
    ]
  },
  async rewrites() {
    return [
      {
        source: "/dashboard/:path*",
        destination: `${dashboardOrigin}/dashboard/:path*`
      },
      {
        source: "/app/:path*",
        destination: `${dashboardOrigin}/app/:path*`
      },
      {
        source: "/onboarding",
        destination: `${dashboardOrigin}/onboarding`
      }
    ];
  }
};

export default nextConfig;

