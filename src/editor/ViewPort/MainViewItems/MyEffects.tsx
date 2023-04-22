
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTexture } from "@react-three/drei";
import { Bloom, SSR, LUT, EffectComposer } from "@react-three/postprocessing";
import { NinjaEditorContext } from '@/editor/NinjaEditorManager';
import { IObjectManagement } from 'ninja-core';
import { Texture } from 'three';

export const MyEffects = () => {
  const editor = useContext(NinjaEditorContext);
  const [effects, setEffects] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setEffects(editor.getEffects());
    const handleEffectsChanged = () => {
      setEffects([...editor.getEffects()]);
    }
    editor.onEffectChanged(handleEffectsChanged);
    return () => {
      editor.offEffectChanged(handleEffectsChanged);
    }
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
    _effect = <Bloom 
                ref={ref}
                luminanceThreshold={om.args.luminanceThreshold}
                mipmapBlur={om.args.mipmapBlur}
                luminanceSmoothing={om.args.luminanceSmoothing}
                intensity={om.args.intensity}
              />;
  }
  else if (om.args.type === "ssr"){
    _effect = <SSR 
                ref={ref} 
                temporalResolve={om.args.temporalResolve}
                USE_MRT={om.args.USE_MRT}
                USE_NORMALMAP={om.args.USE_NORMALMAP}
                USE_ROUGHNESSMAP={om.args.USE_ROUGHNESSMAP}
                ENABLE_JITTERING={om.args.ENABLE_JITTERING}
                ENABLE_BLUR={om.args.ENABLE_BLUR}
                temporalResolveMix={om.args.temporalResolveMix}
                temporalResolveCorrectionMix={om.args.temporalResolveCorrectionMix}
                maxSamples={om.args.maxSamples}
                blurMix={om.args.blurMix}
                blurKernelSize={om.args.blurKernelSize}
                rayStep={om.args.rayStep}
                intensity={om.args.intensity}
                maxRoughness={om.args.maxRoughness}
                jitter={om.args.jitter}
                jitterSpread={om.args.jitterSpread}
                jitterRough={om.args.jitterRough}
                MAX_STEPS={om.args.MAX_STEPS}
                NUM_BINARY_SEARCH_STEPS={om.args.NUM_BINARY_SEARCH_STEPS}
                maxDepthDifference={om.args.maxDepthDifference}
                maxDepth={om.args.maxDepth}
                STRETCH_MISSED_RAYS={om.args.STRETCH_MISSED_RAYS}
                ior={om.args.ior}
                thickness={om.args.thickness}
              />;
  }
  else if (om.args.type === "lut" && om.args.texture){
    const _lut = useTexture(om.args.texture);
    _effect = <LUT lut={_lut as Texture} ref={ref} />;
  }

  return (
    <>
      {_effect}
    </>
  )
}