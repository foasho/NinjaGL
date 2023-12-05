import { useRef } from 'react';

import MonacoEditor from '@monaco-editor/react';
import { IUIManagement } from '@ninjagl/core';

export const UIInspector = ({ um }: { um: IUIManagement }) => {
  return (
    <div>
      {/** Top */}
      <div className='mt-2'>
        <input 
          type='text'
          className='w-full'
          placeholder='Search'
          // onChange={(e) => um.search(e.target.value)}
        />
      </div>
      {/** Left */}
      <div className='mt-2'>
        <input 
          type='text'
          className='w-full'
          placeholder='Search'
          // onChange={(e) => um.search(e.target.value)}
        />
      </div>
      {/** Style */}
      <div className='my-2 h-96'>
        <StyleEditor />
      </div>
    </div>
  );
};

const StyleEditor = () => {
  const code = useRef<string>('');
  const handleEditorChange = (value: string) => {
    if (code.current) code.current = value;
  };
  return (
    <MonacoEditor
      height='100%'
      width='100%'
      language='css'
      theme='vs-dark'
      value={code.current}
      onChange={(value: any) => handleEditorChange(value)}
      // onMount={(editor, monaco) => handleEditorDidMount(monaco, editor)}
      options={{
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        tabSize: 2,
      }}
    />
  );
};
