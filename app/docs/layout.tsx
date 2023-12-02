import { Metadata } from 'next';

import { SideBar } from './_components/Sidebar';

const title = 'Docs - NinjaGL';
const description = 'WebGL 3D Editor';

export const metadata: Metadata = {
  title: {
    default: title,
    template: '',
  },
  description: description,
  applicationName: title,
  manifest: '/manifest.json',
  themeColor: '#000000',
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: '/icons/apple-touch-icon.png',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NinjaGL',
  },
};

export default function DocsLayout({ children }) {
  return (
    <>
      <SideBar />
      <div className='container mx-auto px-4 py-3'>{children}</div>
    </>
  );
}
