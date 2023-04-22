
import React, { useContext, useEffect, useRef, useState } from 'react';
import { } from "@react-three/drei";
import { Bloom, SSR, LUT, EffectComposer } from "@react-three/postprocessing";
import { NinjaEditorContext } from '@/editor/NinjaEditorManager';
import { IObjectManagement } from 'ninja-core';

export const MyEffects = () => {
  const editor = useContext(NinjaEditorContext);
  const [effects, setEffects] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setEffects(editor.getEffects());
    
  }, [editor]);
  return (
    <>
      {effects.length > 0 && 
      <>
        <EffectComposer>
          {effects.map((om) => {
            return <MyEffect om={om} key={om.id} />
          })}
        </EffectComposer>
      </>
      } 
    </>
  )
}

const MyEffect = ({ om }) => {
  const ref = useRef<any>();
  let _effect;
  if (om.args.type === "bloom"){
    _effect = <Bloom ref={ref} />;
  }
  else if (om.args.type === "ssr"){
    _effect = <SSR ref={ref} />;
  }
  else if (om.args.type === "lut"){
    _effect = <LUT lut={om.args.lut} ref={ref} />;
  }

  return (
    <>
      {_effect}
    </>
  )
}