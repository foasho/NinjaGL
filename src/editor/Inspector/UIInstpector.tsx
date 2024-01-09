import { useState } from "react";

import { IUIManagement } from "@ninjagl/core";
import { useSnapshot } from "valtio";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { globalUIStore } from "../Store/Store";

export const UIInspector = () => {
  const { currentId } = useSnapshot(globalUIStore);
  const { ums } = useNinjaEditor();

  const selectUI = currentId ? ums.current.find((um) => um.id === currentId) : null;

  return <>{selectUI && <UIInspectorItem um={selectUI} />}</>;
};

const UIInspectorItem = ({ um }: { um: IUIManagement }) => {
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
  const [code, setCode] = useState<string>("");
  return <></>;
};
