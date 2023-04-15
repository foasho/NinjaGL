import { NinjaEngineContext } from "../NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import { Environment, Sky, SpotLight, SpotLightShadow, Detailed } from "@react-three/drei"
import { useContext } from "react"
import { MathUtils } from "three";
import { ShaderMaterial } from "three";

const Light = (om: IObjectManagement) => {
  let light = undefined;
  if (om.args.type == "spot") {
    light = (
      <>
        <SpotLight
          position={om.args.position ? om.args.position : [0, 0, 0]}
          angle={MathUtils.degToRad(45)}
          distance={om.args.distance ? om.args.distance : 25}
          intensity={om.args.intensity ? om.args.intensity : 25}
          castShadow
          color={'#fadcb9'}
          volumetric={false}
          // layers={om.layerNum}
        />
      </>
    )
  }
  else if (om.args.type == "point") {
    light = (
      <>
        <pointLight
          position={om.args.position ? om.args.position : [0, 0, 0]}
          intensity={om.args.intensity ? om.args.intensity : 0.5}
          distance={om.args.distance ? om.args.distance : 25}
          castShadow
          // layers={om.layerNum}
        />
      </>
    )
  }
  else if (om.args.type == "ambient") {
    light = (
      <>
        <ambientLight
          color={om.args.color ? om.args.color : '#fadcb9'}
          intensity={om.args.intensity ? om.args.intensity : 0.5}
          // layers={om.layerNum}
        />
      </>
    )
  }
  else if (om.args.type == "direction") {
    light = (
      <>
        <directionalLight
          castShadow
          position={om.args.position? om.args.position: [5, 5, 5]}
          // layers={om.layerNum}
        />
      </>
    )
  }

  return (
    <>
      {light}
    </>
  )
}

export const Lights = () => {
  const engine = useContext(NinjaEngineContext);
  const lights = engine ? engine.getLights() : [];
  
  return (
    <>
      {lights.map((light, index) => {
        return <Light {...light} key={index} />
      })}
    </>
  )
}