import React from "react";
import Link from "next/link";
import { Button } from "@nextui-org/react";

export const Footer = () => {
  return (
    <>
      <div className='absolute left-1/2 top-36 z-20 -translate-x-1/2 text-center'>
        <p className='text-2xl text-white md:text-4xl'>Web First GameEngine</p>
      </div>
      <div className='absolute bottom-16 left-1/2 z-20 w-3/4 max-w-80 -translate-x-1/2'>
        <div className='grid grid-cols-2 gap-2 text-center'>
          <Button
            as={Link}
            href='/editor'
            className='border border-cyber bg-transparent px-4 py-2 text-cyber hover:bg-black/25'
          >
            ログインせずにはじめる
          </Button>
          <Button as={Link} href='/projects' className='bg-cyber/75 text-center text-white hover:bg-cyber/50'>
            プロジェクト作成
          </Button>
        </div>
        <div className='grid grid-cols-3 gap-4 pt-4 text-center font-bold text-cyber'>
          <Link
            href='/docs/tutorial'
            target='_blank'
            className='cursor-pointer rounded-sm border-b-1 border-cyber py-2 hover:bg-cyber/25'
          >
            チュートリアル
          </Link>
          <Link
            href='https://github.com/foasho/NinjaGL'
            target='_blank'
            className='cursor-pointer rounded-sm border-b-1 border-cyber py-2 hover:bg-cyber/25'
          >
            Github
          </Link>
          <Link
            href='/docs'
            target='_blank'
            className='cursor-pointer rounded-sm border-b-1 border-cyber py-2 hover:bg-cyber/25'
          >
            ドキュメント
          </Link>
        </div>
      </div>
    </>
  );
};
