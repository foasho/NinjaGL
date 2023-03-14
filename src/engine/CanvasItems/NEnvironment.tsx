import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { Environment, Sky, SpotLight, SpotLightShadow } from "@react-three/drei"
import { useContext } from "react"
import { MathUtils } from "three";
import { ShaderMaterial } from "three";

export interface INEnvironmentProps { }

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

export const NEnvironment = () => {
  const engine = useContext(NaniwaEngineContext);
  const sky = engine ? engine.getSky() : null;
  const lights = engine ? engine.getLights() : [];
  console.log(sky);
  return (
    <>
      {lights.map((light) => {
        return <Light {...light} />
      })}

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