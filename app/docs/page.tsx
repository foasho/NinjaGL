'use client';
import { Snippet } from '@nextui-org/react';

const DocsIntro = () => {
  return (
    <>
      <div className='text-4xl font-bold'>Ninja UI</div>
      <div>
        <Snippet>npm install @ninjagl/core</Snippet>
        <Snippet>yarn add @ninjagl/core</Snippet>
        <Snippet>pnpm add @ninjagl/core</Snippet>
      </div>
    </>
  );
};

export default DocsIntro;
