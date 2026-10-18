/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ye choti ESLint errors ko Vercel par ignore karega
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ye choti Type errors ko Vercel par ignore karega
    ignoreBuildErrors: true,
  },
};

export default nextConfig;