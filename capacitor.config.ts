import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tebra.mhmvp",
  appName: "Tebra Mental Health",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
      style: "dark",
    },
    StatusBar: {
      style: "dark",
    },
  },
};

export default config;
