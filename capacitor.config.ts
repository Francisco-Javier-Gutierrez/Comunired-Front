import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comunired.app',
  appName: 'Comunired',
  webDir: 'dist',
  server: {
    url: 'https://comuni-red.com',
    cleartext: true
  }
};

export default config;
