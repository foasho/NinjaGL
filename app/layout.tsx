import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { PWAProvider } from "@/hooks/usePWA";
import { mplus } from "@/styles/font";

import RootProvider from "./provider";

import "./global.css";

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

interface Props {
  children: React.ReactNode;
}
export default function RootLayout({ children }: Props) {
  return (
    <html lang='ja' className='antialiased'>
      <head />
      <body className={`${mplus.variable}`}>
        <NextTopLoader showSpinner={false} color='#43D9D9' />
        <RootProvider>
          <PWAProvider>
            {children}
          </PWAProvider>
        </RootProvider>
      </body>
    </html>
  );
}
