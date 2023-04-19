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
  const texture = useTexture(om.args.texture);
  let effect;
  switch (om.args.type) {
    case "SSR":
      effect = <SSR
        />
      break;
    case "Bloom":
      effect = <Bloom/>
      break;
    case "LUT":
      if (!texture) {
        return null;
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