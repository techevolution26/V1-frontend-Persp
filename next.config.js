/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    API_URL: process.env.API_URL,
  },

  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: `${process.env.API_URL}/storage/:path*`,
      },

       {
        source: "/api/:path*",
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
