'use client';
import { Snippet } from '@nextui-org/react';

const DocsIntro = () => {
  return (
    <>
      <div className='text-4xl font-bold'>Install Usage</div>
      <div>
        <div>
          Library Install
        </div>
        <div className="mt-3">
          <div>
            npmでの利用
          </div>
          <Snippet>npm install @ninjagl/core</Snippet>
        </div>
        <div className="mt-3">
          <div>
            yarnでの利用
          </div>
          <Snippet>yarn add @ninjagl/core</Snippet>
        </div>
        <div className="mt-3">
          <div>
            pnpmでの利用
          </div>
          <Snippet>pnpm add @ninjagl/core</Snippet>
        </div>
      </div>
    </>
  );
};

export default DocsIntro;
