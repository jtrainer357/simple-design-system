import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.NODE_ENV === "development";

const config: CapacitorConfig = {
  appId: "com.tebra.mhmvp",
  appName: "Tebra Mental Health",
  webDir: "out",
  server: {
    androidScheme: "https",
    // In dev mode, connect to Next.js dev server for hot reload
    ...(isDev && {
      url: "http://localhost:3000",
      cleartext: true,
    }),
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
      style: "light",
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#FFFFFF",
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0D9488", // Growth Teal
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
