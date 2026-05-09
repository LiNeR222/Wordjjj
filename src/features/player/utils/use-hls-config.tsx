import { HlsConfig } from 'hls.js';
import { useEffect, useState } from 'react';
import { getHlsLoaders } from './helpers';

export const useHlsConfig = () => {
  const [hlsConfig, setHlsConfig] = useState<Partial<HlsConfig> | null>(null);

  useEffect(() => {
    const loadHlsConfig = async () => {
      const loaders = await getHlsLoaders();
      setHlsConfig(hlsOptions => ({ ...hlsOptions, ...loaders }));
    };

    loadHlsConfig();
  }, []);

  return hlsConfig;
};
