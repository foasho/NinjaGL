import React, { useContext } from 'react';
import {  } from '@react-three/drei';
import { EffectComposer, Bloom, SSR, LUT } from "@react-three/postprocessing";
import { IObjectManagement } from '../utils/NinjaProps';
import { NinjaEngineContext } from '../utils/NinjaEngineManager';

export const MyEffects = () => {
  const engine = useContext(NinjaEngineContext);
  const [effects, setEffects] = React.useState<IObjectManagement[]>([]);
  React.useEffect(() => {
    setEffects(engine.getEffects());
  }, [engine]);
  return (
    <>
     {effects.length > 0 && (
      <EffectComposer>
        {effects.map((om) => {
          return <MyEffect om={om} key={om.id}/>
        })}
      </EffectComposer>
     )}
    </>
  )
}

const MyEffect = ({ om }) => {
  let _effect;
  if (om.args.type == "bloom"){
    _effect = <Bloom luminanceThreshold={om.args.luminanceThreshold}/>
  }
  if (om.args.type == "ssr"){
    _effect = <SSR 
                // refractionRatio={om.args.refractionRatio} 
                // maxDistance={om.args.maxDistance} 
                // blendMode={om.args.blendMode}
              />
  }
  if (om.args.type == "lut"){
    _effect = <LUT 
                lut={om.args.lut} 
                // intensity={om.args.intensity}
              />
  }
  return (
    <>
      {_effect}
    </>
  )
}

