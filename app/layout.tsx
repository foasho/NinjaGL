import "./global.css";
import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { PWAProvider } from "@/hooks/usePWA";
import RootProvider from "@/root.container";
import { mplus } from "@/styles/font";

import { Toast } from "./_components/Toast";

const title = "NinjaGL";
const description = "WebGL 3D Editor";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s(β版)",
  },
  description: description,
  applicationName: title,
  manifest: "/manifest.json",
  themeColor: "#000000",
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: "/icons/apple-touch-icon.png",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NinjaGL",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='ja' className='antialiased'>
      <head />
      <body className={`${mplus.variable}`}>
        <NextTopLoader showSpinner={false} color='#43D9D9' />
        <RootProvider>
          <PWAProvider>{children}</PWAProvider>
          <Toast />
        </RootProvider>
      </body>
    </html>
  );
}
