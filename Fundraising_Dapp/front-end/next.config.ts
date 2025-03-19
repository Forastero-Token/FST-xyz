/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_STACKS_NETWORK: process.env.NEXT_PUBLIC_STACKS_NETWORK,
    NEXT_PUBLIC_DEVNET_HOST: process.env.NEXT_PUBLIC_DEVNET_HOST,
    NEXT_PUBLIC_PLATFORM_HIRO_API_KEY: process.env.NEXT_PUBLIC_PLATFORM_HIRO_API_KEY,
    NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS,
    NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS,
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint during the build process
  },
};

export default nextConfig;
