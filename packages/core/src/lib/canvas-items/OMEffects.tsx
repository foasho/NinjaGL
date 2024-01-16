import React from "react";
import { IObjectManagement } from "../utils";
import { LUTCubeLoader } from "three-stdlib";
import { Bloom, LUT, SSR, EffectComposer } from "@react-three/postprocessing";
import { Texture } from "three";
import { useNinjaEngine } from "../hooks";

export const OMEffects = () => {
  const { oms } = useNinjaEngine();
  const effects = React.useMemo(() => {
    return oms.filter((om) => om.type === "effect");
  }, [oms]);

  return (
    <>
      {effects.length > 0 && (
        <EffectComposer disableNormalPass>
          {effects.map((om: IObjectManagement) => {
            return <MyEffect om={om} key={om.id} />;
          })}
        </EffectComposer>
      )}
    </>
  );
};

/**
 * -------
 * Effect
 * -------
 */
const MyEffect = ({ om }: { om: IObjectManagement }) => {
  const [texture, setTexture] = React.useState<any>(null);

  React.useEffect(() => {
    if (om.args.type === "lut" && om.args.texture) {
      const loader = new LUTCubeLoader();
      loader.load(om.args.texture, (loadedTexture) => {
        setTexture(loadedTexture);
      });
    } else {
      setTexture(null);
    }
  }, [om]);

  const effect = React.useMemo(() => {
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
    else {
      return <></>;
    }
  }, [om, texture]);

  return <>{effect}</>;
};
