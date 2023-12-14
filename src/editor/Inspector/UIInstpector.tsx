import { useState } from 'react';

import { IUIManagement } from '@ninjagl/core';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useSnapshot } from 'valtio';

import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { globalUIStore } from '../Store/Store';

export const UIInspector = () => {
  const { currentId } = useSnapshot(globalUIStore);
  const { ums } = useNinjaEditor();

  console.log('currentId', currentId);

  const selectUI = currentId ? ums.find((um) => um.id === currentId) : null;

  return <>{selectUI && <UIInspectorItem um={selectUI} />}</>;
};

const UIInspectorItem = ({ um }: { um: IUIManagement }) => {
  console.log(um);

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
      <div className='relative my-2 h-96'>
        <StyleEditor />
      </div>
    </div>
  );
};

const StyleEditor = () => {
  const [code, setCode] = useState<string>('');
  return (
    <CodeEditor
      value={code}
      language='css'
      placeholder='Please enter JS code.'
      onChange={(evn) => setCode(evn.target.value)}
      padding={15}
      style={{
        backgroundColor: '#f5f5f5',
        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
      }}
    />
  );
};
