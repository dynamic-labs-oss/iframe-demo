'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

// Create the config only if it hasn't been created before
const createConfig = () => {
  return getDefaultConfig({
    appName: 'RainbowKit App',
    projectId: 'YOUR_PROJECT_ID',
    chains: [
      mainnet,
      polygon,
      optimism,
      arbitrum,
      base,
      ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    ssr: true,
  });
};

// Export a singleton instance of the config
export const config = typeof window !== 'undefined' ? createConfig() : null;