'use client';
import { Snippet } from '@nextui-org/react';
import SyntaxHighlighter from 'react-syntax-highlighter';

const codeStared = `
import { NinjaGL } from "@ninjagl/core";

function App() {

  return (
    <NinjaGL njcPath={"<YourNjcFile>"} />
  );
}
`;

const codeMerge = `
import { NinjaGL } from "@ninjagl/core";

function App() {

  return (
    <NinjaGL njcPath={"<YourNjcFile>"} >
      <!-- Your React Three Fiber Code -->
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </NinjaGL>
  );
}
`;

const codeAppend = `
import { NinjaGL } from "@ninjagl/core";

function App() {

  return (
    <NinjaGL njcPath={"<YourNjcFile>"} noCanvas>
      <Canvas>
        <!-- Your React Three Fiber Code -->
      <Canvas/>
    </NinjaGL>
  );
}
`;

const DocsIntro = () => {
  return (
    <>
      <div className='text-4xl font-bold'>Installation</div>
      <div className='mt-4 py-3 text-2xl font-bold'>Library Install</div>
      <div>
        <div className='mt-3'>
          <div className='p-2 text-lg font-bold'>npmでの利用</div>
          <Snippet>npm install @ninjagl/core</Snippet>
        </div>
        <div className='mt-3'>
          <div className='p-2 text-lg font-bold'>yarnでの利用</div>
          <Snippet>yarn add @ninjagl/core</Snippet>
        </div>
        <div className='mt-3'>
          <div className='p-2 text-lg font-bold'>pnpmでの利用</div>
          <Snippet>pnpm add @ninjagl/core</Snippet>
        </div>
      </div>
      <div className='mt-6 py-3 text-2xl font-bold'>Usages</div>
      <div className='mt-3'>
        <div className='p-2 text-lg font-bold'>Normal Usage</div>
        <SyntaxHighlighter className='rounded-lg' language='react'>
          {codeStared}
        </SyntaxHighlighter>
      </div>
      <div className='mt-3'>
        <div className='p-2 text-lg font-bold'>Merge R3F Resource</div>
        <SyntaxHighlighter className='rounded-lg' language='react'>
          {codeMerge}
        </SyntaxHighlighter>
      </div>
      <div className='mt-3'>
        <div className='p-2 text-lg font-bold'>Append Already R3F</div>
        <SyntaxHighlighter className='rounded-lg' language='react'>
          {codeAppend}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default DocsIntro;
