import { Suspense } from 'react';

import { Header } from './_components/Header';
import { HomeCanvas } from './_components/HomeCanvas';

export default function HomePage() {
  return (
    <>
      <Header />
      <div className='relative z-0 h-screen w-screen'>
        {/** HTML */}
        <div className='absolute left-0 top-0 z-20 overflow-y-auto'>
          {/** Scroll1: Hero Content Text */}
          <div className='relative h-screen'>
            {/* Hero文字やタイトル等 */}
            <div className='fixed left-1/2 top-36 z-20 -translate-x-1/2 text-center'>
              <p className='text-2xl text-white md:text-4xl'>Web First GameEngine</p>
            </div>
          </div>

          {/** Scroll2: Features */}
          <div className='relative h-screen'></div>
        </div>

        {/** Canvas */}
        <div className='absolute left-0 top-0 z-10 h-[100vh] w-full'>
          <Suspense>
            <HomeCanvas />
          </Suspense>
        </div>
      </div>
    </>
  );
}
