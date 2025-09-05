/** @type {import('next').NextConfig} */
const nextConfig = {
  // আপনার অন্যান্য কনফিগারেশন এখানে থাকতে পারে
  experimental: {
    // Firebase Studio-তে Cross Origin নোটিশটি ঠিক করার জন্য
    allowedOrigins: ["*.cloudworkstations.dev"],
  },
};

module.exports = nextConfig;