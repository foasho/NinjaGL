import { Suspense } from 'react';

import Link from 'next/link';

import { Header } from './_components/Header';
import { HomeCanvas } from './_components/HomeCanvas';

export default function HomePage() {
  return (
    <div className='bg-[#504F56]'>
      <Header />
      <div className='relative z-20 h-screen w-screen'>
        {/* Hero文字やタイトル等 */}
        <div className='absolute left-1/2 top-36 z-20 -translate-x-1/2 text-center'>
          <p className='text-2xl text-white md:text-4xl'>Web First GameEngine</p>
        </div>
        <div className='absolute bottom-24 left-1/2 z-20 -translate-x-1/2'>
          <div className='flex justify-center'>
            <Link
              href='/editor'
              className='cursor-pointer rounded-md border border-cyber px-4 py-2 text-cyber hover:bg-black/25'
            >
              はじめる
            </Link>
          </div>
        </div>
        <div className='absolute bottom-12 left-1/2 z-20 -translate-x-1/2'>
          <div className='flex grid-cols-3 gap-4 text-center font-bold text-cyber'>
            <div>
              <Link href='/examples' className='cursor-pointer border-cyber py-2 hover:border-b-1'>
                ゲームサンプル
              </Link>
            </div>
            <div>
              <Link
                href='https://github.com/foasho/NinjaGL'
                target='_blank'
                className='cursor-pointer border-cyber py-2 hover:border-b-1'
              >
                Github
              </Link>
            </div>
            <div>
              <Link href='/docs' className='mr-3 cursor-pointer border-cyber py-2 hover:border-b-1'>
                ドキュメント
              </Link>
            </div>
          </div>
        </div>

        {/** Canvas */}
        <div className='fixed left-0 top-0 z-10 h-[100vh] w-full'>
          <Suspense>
            <HomeCanvas />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
