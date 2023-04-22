import React, { useContext, useEffect, useState } from "react";
import { EffectComposer, SSR, Bloom, LUT } from "@react-three/postprocessing";
import { NinjaEngineContext } from "./NinjaEngineManager";
import { useTexture } from "@react-three/drei";
import { Texture } from "three";

export const MyEffects = () => {
  const engine = useContext(NinjaEngineContext);
  const [effects, setEffects] = useState(engine.getEffects());
  useEffect(() => {
    setEffects(engine.getEffects());
  }, [engine]);
  return (
    <>
      {effects.length > 0 &&
        <EffectComposer disableNormalPass>
          {effects.map((om, index) => {
            return <MyEffect om={om} key={index} />
          })
          }
        </EffectComposer>
      }
    </>
  )
}

const MyEffect = ({ om }) => {
  let effect;
  switch (om.args.type) {
    case "SSR":
      effect = <SSR                                temporalResolve={om.args.temporalResolve}
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
                />
      break;
    case "Bloom":
      effect = <Bloom
                luminanceThreshold={om.args.luminanceThreshold}
                mipmapBlur={om.args.mipmapBlur}
                luminanceSmoothing={om.args.luminanceSmoothing}
                intensity={om.args.intensity}
                />
      break;
    case "LUT":
      const texture = useTexture(om.args.texture);
      if (!texture) {
        return <></>;
      }
      else if (texture instanceof Texture){
        effect = <LUT
          lut={texture as Texture}
        />
      }
      break;
    default:
      break;
  }
  return (
    <>
      {effect}
    </>
  )
}