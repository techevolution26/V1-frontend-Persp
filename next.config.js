/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination: `${process.env.API_URL || "http://localhost:8000"}/storage/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
