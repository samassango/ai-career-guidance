// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   cacheComponents: true
// };

// export default nextConfig;

module.exports = {
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}