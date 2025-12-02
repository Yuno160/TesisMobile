import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'SEDCI',
  webDir: 'www',
  server: {
    androidScheme: 'http',      
    cleartext: true,            
    allowNavigation: ['*']      
  },
};

export default config;
