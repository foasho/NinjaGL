import localFont from 'next/font/local';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// カスタムローカルフォントを定義する
const mplus = localFont({
  src: './MPLUS.ttf',
  variable: "--font-mplus",
  display: 'swap',
});

export { mplus };