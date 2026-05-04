const appUrl = process.env.CAPACITOR_APP_URL || "http://10.0.2.2:3000"

const config = {
  appId: "com.immosmart.dashboard",
  appName: "ImmoSmart Dashboard",
  webDir: ".next",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://"),
  },
}

export default config
