import React, { useEffect } from 'react';
import * as Updates from 'expo-updates';

export const AutoUpdater: React.FC = () => {
  useEffect(() => {
    const run = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        // ignore update errors to avoid blocking app start
      }
    };
    // only attempt in production binaries (not in dev client)
    if (!__DEV__) run();
  }, []);
  return null;
};
