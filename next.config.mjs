/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "pub-133f8593b35749f28fa090bc33925b31.r2.dev",
      "inventoryapi-367404119922.asia-southeast1.run.app",
      "s1.cdn.autoevolution.com"
    ],
    remotePatterns: [
      {
       protocol: 'https',
        hostname: '3e9ba1992b6ab16daf095995f9626a57.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 's1.cdn.autoevolution.com',
      },
    ],
  },
};

export default nextConfig;
