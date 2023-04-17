import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { Sky } from "@react-three/drei"
import React, { useContext } from "react"

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