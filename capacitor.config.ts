import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.changeit.todoapp',
  appName: 'Todo-App',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

if (process.env.NODE_ENV === 'development' && process.env.VITE_DEV_SERVER_URL) {
  config.server = {
    ...config.server,
    url: process.env.VITE_DEV_SERVER_URL,
  };
}

export default config;
