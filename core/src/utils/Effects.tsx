import React, { useContext, useEffect, useMemo, useState } from "react";
import { EffectComposer, SSR, Bloom, LUT } from "@react-three/postprocessing";
import { NinjaEngineContext } from "./NinjaEngineManager";
import { useTexture } from "@react-three/drei";
import { Texture } from "three";
import { LUTCubeLoader } from "three-stdlib";

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
  const [renderCount, setRenderCount] = useState(0);
  const engine = useContext(NinjaEngineContext);
  const [texture, setTexture] = useState(null);
  const id = om.id;

  useEffect(() => {
    if (om.args.type === "lut" && om.args.texture) {
      const loader = new LUTCubeLoader();
      loader.load(om.args.texture, (loadedTexture) => {
        setTexture(loadedTexture);
      });
    } else {
      setTexture(null);
    }
    const handleIdChanged = () => {
      setRenderCount(renderCount + 1);
    }
    // engine.onOMIdChanged(id, handleIdChanged);
    // return () => {
    //   engine.offOMIdChanged(id, handleIdChanged);
    // }
  }, [om, renderCount]);

  const effect = useMemo(() => {
    if (om.args.type === "bloom") {
      return (
        <Bloom
          luminanceThreshold={om.args.luminanceThreshold}
          mipmapBlur={om.args.mipmapBlur}
          luminanceSmoothing={om.args.luminanceSmoothing}
          intensity={om.args.intensity}
        />
      );
    } else if (om.args.type === "ssr") {
      return (
        <SSR
          {...om.args}
        />
      );
    } else if (om.args.type === "lut" && texture) {
      return <LUT lut={texture as Texture} />;
    }
  }, [om, texture, renderCount]);

  return <>{effect}</>;
};