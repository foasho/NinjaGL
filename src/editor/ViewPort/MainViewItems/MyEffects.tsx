import React, { useEffect, useMemo, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { Bloom, EffectComposer, LUT, SSR } from "@react-three/postprocessing";
import { Texture } from "three";
import { LUTCubeLoader } from "three-stdlib";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const MyEffects = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [effects, setEffects] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    const update = () => {
      const _oms = oms.current.filter((om) => om.type == "effect");
      if (effects !== _oms) {
        setEffects(_oms);
      }
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, []);

  return (
    <>
      {effects.length > 0 && (
        <>
          <EffectComposer>
            {effects.map((om) => {
              return <MyEffect om={om} key={om.id} />;
            })}
          </EffectComposer>
        </>
      )}
    </>
  );
};

const MyEffect = ({ om }: { om: IObjectManagement }) => {
  const [renderCount, setRenderCount] = useState(0);
  const editor = useNinjaEditor();
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
    };
    editor.onOMIdChanged(id, handleIdChanged);
    return () => {
      editor.offOMIdChanged(id, handleIdChanged);
    };
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
      return <SSR {...om.args} />;
    } else if (om.args.type === "lut" && texture) {
      return <LUT lut={texture as Texture} />;
    }
  }, [om, texture, renderCount]);

  return <>{effect}</>;
};
