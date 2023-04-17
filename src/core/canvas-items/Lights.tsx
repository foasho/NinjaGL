import { NinjaEngineContext } from "../NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import { Environment, Sky, SpotLight, SpotLightShadow, Detailed } from "@react-three/drei"
import { useContext, useEffect, useState } from "react"
import { MathUtils } from "three";
import { ShaderMaterial } from "three";

const Light = (om: IObjectManagement) => {
  let light = undefined;
  let color: string = (om.args.materialData.value) ? om.args.materialData.value : '#fadcb9';
  if (om.args.type == "spot") {
    light = (
      <>
        <SpotLight
          position={om.args.position ? om.args.position : [0, 0, 0]}
          angle={MathUtils.degToRad(45)}
          distance={om.args.distance ? om.args.distance : 25}
          intensity={om.args.intensity ? om.args.intensity : 25}
          castShadow
          color={color}
          volumetric={false}
          layers={om.layerNum}
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
          color={color}
          layers={om.layerNum}
        />
      </>
    )
  }
  else if (om.args.type == "ambient") {
    light = (
      <>
        <ambientLight
          intensity={om.args.intensity ? om.args.intensity : 0.5}
          color={color}
          layers={om.layerNum}
        />
      </>
    )
  }
  else if (om.args.type == "directional") {
    light = (
      <>
        <directionalLight
          castShadow
          position={om.args.position? om.args.position: [5, 5, 5]}
          color={color}
          layers={om.layerNum}
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
  const [lights, setLights] = useState(engine.getLights());

  useEffect(() => {
    console.log("Lights useEffect");
    setLights(engine.getLights());
    const handleLightsChanged = () => {
      setLights(engine.getLights());
    }
    engine.onLightsChanged(handleLightsChanged);
    return () => {
      engine.offLightsChanged(handleLightsChanged);
    }
  }, [engine]);
  
  return (
    <>
      {lights.map((light, index) => {
        return <Light {...light} key={index} />
      })}
    </>
  )
}