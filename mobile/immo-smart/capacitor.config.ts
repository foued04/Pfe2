import type { CapacitorConfig } from '@capacitor/cli';

const appUrl = process.env.CAPACITOR_APP_URL;

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ImmoSmart',
  webDir: 'dist',
};

if (appUrl) {
  config.server = {
    url: appUrl,
    cleartext: appUrl.startsWith('http://'),
  };
}

export default config;
