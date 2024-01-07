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
      <div className='fixed top-0 max-h-screen w-screen overflow-y-auto bg-gradient-to-r from-cyan-500 to-cyber pb-16 pt-[80px]'>
        <link
          href='https://cdnjs.cloudflare.com/ajax/libs/prism/1.9.0/themes/prism-tomorrow.min.css'
          rel='stylesheet'
        />
        <article className='container prose prose-xl mx-auto rounded-lg bg-white/75 px-6 py-5 shadow-xl'>{children}</article>;
      </div>
    </>
  );
}
