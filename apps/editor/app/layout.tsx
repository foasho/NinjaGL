import "./global.css";
import { cache } from "react";
import { headers } from "next/headers";
import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { PWAProvider } from "@/hooks/usePWA";
import RootProvider from "@/root.container";
import { mplus } from "@/styles/font";

import { Toaster } from "@acme/ui/toast";
import { env } from "../env";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "@acme/auth";

const getHeaders = cache(async () => headers());

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

type Props = {
  children: React.ReactNode;
};
export default function RootLayout({ children }: Props) {
  return (
    <html lang='ja' className='antialiased'>
      <head />
      <body className={`${mplus.variable}`}>
        <NextTopLoader showSpinner={false} color='#43D9D9' />
        <SessionProvider>
          <TRPCReactProvider headersPromise={getHeaders()}>
            <RootProvider>
              <PWAProvider>{children}</PWAProvider>
              {/* <Toast /> */}
              <Toaster />
            </RootProvider>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
