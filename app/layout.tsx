import './global.css';
import { Metadata } from "next";
import RootProvider from "@/root.container";
import { mplus } from '@/styles/font';
import { Toast } from "./_components/Toast";
import { Header } from './_components/Header';

const title = 'NinjaGL'
const url = 'https://ninjagl.vercel.app/'
const description = 'WebGL 3D Editor'
const author = 'ShoOsaka'
const twitter = '@sakanosho'

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
    title: 'NinjaGL',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className='antialiased'>
      <head />
      <body className={`${mplus.variable}`}>
        <RootProvider>
          {children}
          <Toast />
        </RootProvider>
      </body>
    </html>
  )
}
