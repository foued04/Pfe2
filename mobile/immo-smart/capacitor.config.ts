import type { CapacitorConfig } from '@capacitor/cli';

const appUrl = process.env.CAPACITOR_APP_URL;

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ImmoSmart',
  webDir: 'dist',
  plugins: {
    GoogleSignIn: {
      clientId: '626384690424-3nvdqlcqomgqnn3sdd48r3uuk7sv1q59.apps.googleusercontent.com',
      serverClientId: '626384690424-3nvdqlcqomgqnn3sdd48r3uuk7sv1q59.apps.googleusercontent.com',
    },
  },
};

if (appUrl) {
  config.server = {
    url: appUrl,
    cleartext: appUrl.startsWith('http://'),
  };
}

export default config;
