import React, { useContext, useState, useEffect, useMemo } from 'react';
import {  } from '@react-three/drei';
import { EffectComposer, Bloom, SSR, LUT } from "@react-three/postprocessing";
import { IObjectManagement } from '../utils/NinjaProps';
import { NinjaEngineContext } from '../utils/NinjaEngineManager';
import { LUTCubeLoader } from 'three-stdlib';
import { Texture } from 'three';

export const MyEffects = () => {
  const engine = useContext(NinjaEngineContext);
  const [effects, setEffects] = useState<IObjectManagement[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEffects(engine.getEffects());
    const handleEffectsChanged = () => {
      setEffects([...engine.getEffects()]);
    };
    // engine.onEffectChanged(handleEffectsChanged);
    setReady(true);
    return () => {
      // engine.offEffectChanged(handleEffectsChanged);
    };
  }, [engine]);

  return (
    <>
      {ready && effects.length > 0 && 
      <>
        <EffectComposer disableNormalPass>
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
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (om.args.type === "lut" && om.args.texture) {
      const loader = new LUTCubeLoader();
      loader.load(om.args.texture, (loadedTexture) => {
        setTexture(loadedTexture);
      });
    } else {
      setTexture(null);
    }
  }, [om]);

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
          // ... All SSR props
        />
      );
    } else if (om.args.type === "lut" && texture) {
      return <LUT lut={texture as Texture} />;
    }
  }, [om, texture]);

  return <>{effect}</>;
};

