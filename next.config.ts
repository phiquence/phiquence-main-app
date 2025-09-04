
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    MOTHER_WALLET_USDT_BEP20: process.env.MOTHER_WALLET_USDT_BEP20,
    MOTHER_WALLET_BNB_BEP20: process.env.MOTHER_WALLET_BNB_BEP20,
    MOTHER_WALLET_PHI_BEP20: process.env.MOTHER_WALLET_PHI_BEP20,
    NEXT_PUBLIC_PHI_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_PHI_CONTRACT_ADDRESS,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  }
};

export default nextConfig;
