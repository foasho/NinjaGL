import { NinjaEngineContext } from "@/core/NinjaEngineManager";
import { IObjectManagement } from "@/core/utils/NinjaProps";
import { Environment, Sky, SpotLight, SpotLightShadow } from "@react-three/drei"
import { useContext } from "react"
import { MathUtils } from "three";
import { ShaderMaterial } from "three";

export const SkyComponents = () => {
  const engine = useContext(NinjaEngineContext);
  const sky = engine ? engine.getSky() : null;
  return (
    <>
      {sky &&
        <>
          <Sky
            distance={sky.args.distance ? sky.args.distance : 450000}
            sunPosition={sky.args.sunPosition ? sky.args.sunPosition : [0, 1, 0]}
            inclination={sky.args.inclination ? sky.args.inclination : 0}
            azimuth={sky.args.azimuth ? sky.args.azimuth : 0}
          />
        </>
      }
    </>
  )
}