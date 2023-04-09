import { NinjaEngineContext } from "@/core/utils/NinjaEngineManager";
import { IObjectManagement } from "@/core/utils/NinjaProps";
import { Environment, Sky, SpotLight, SpotLightShadow } from "@react-three/drei"
import { useContext } from "react"
import { MathUtils } from "three";
import { ShaderMaterial } from "three";

const Light = (props: IObjectManagement) => {
  let light = undefined;
  if (props.args.type == "spot") {
    light = (
      <>
        <SpotLight
          position={props.args.position ? props.args.position : [0, 0, 0]}
          angle={MathUtils.degToRad(45)}
          distance={props.args.distance ? props.args.distance : 25}
          intensity={props.args.intensity ? props.args.intensity : 25}
          castShadow
          color={'#fadcb9'}
          volumetric={false}
          layers={props.layerNum}
        />
      </>
    )
  }
  else if (props.args.type == "point") {
    light = (
      <>
        <pointLight
          position={props.args.position ? props.args.position : [0, 0, 0]}
          intensity={props.args.intensity ? props.args.intensity : 0.5}
          distance={props.args.distance ? props.args.distance : 25}
          castShadow
          layers={props.layerNum}
        />
      </>
    )
  }
  else if (props.args.type == "ambient") {
    light = (
      <>
        <ambientLight
          color={props.args.color ? props.args.color : '#fadcb9'}
          intensity={props.args.intensity ? props.args.intensity : 0.5}
          layers={props.layerNum}
        />
      </>
    )
  }
  else if (props.args.type == "direction") {
    light = (
      <>
        <directionalLight
          castShadow
          position={props.args.position? props.args.position: [5, 5, 5]}
          layers={props.layerNum}
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
      {lights.map((light) => {
        return <Light {...light} />
      })}
    </>
  )
}