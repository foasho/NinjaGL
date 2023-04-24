import { Environment, Lightformer } from "@react-three/drei";
import React, { useContext, useState, useEffect } from "react";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";
import { Vector3 } from "three";

export const MyEnvirments = () => {
  const [degraded, degrade] = useState(false)
  const engine = useContext(NinjaEngineContext);
  const [environment, setEnvironment] = useState<IObjectManagement>();
  const [lightformers, setLightformers] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setEnvironment(engine.getEnvironment());
    setLightformers(engine.getLightFormers());
    const handleEnvChanged = () => {
      setEnvironment(engine.getEnvironment()?{...engine.getEnvironment()}: undefined);
      setLightformers([...engine.getLightFormers()]);
    }
    engine.onEnvChanged(handleEnvChanged);
    return () => {
      engine.offEnvChanged(handleEnvChanged);
    }
  }, [engine]);
  return (
    <>
      {environment &&
        <>
          <Environment 
            resolution={512}
            preset={environment.args.preset}
            background={environment.args.background}
            blur={environment.args.blur}
            frames={(degraded && lightformers.length > 0) ? 1 : Infinity}
          >
            {lightformers.map((om) => {
              return <LightFormer om={om} key={om.id}/>
            })}
          </Environment>
        </>
      }
      {!environment && lightformers.length > 0 &&
        <>
          <Environment 
            frames={(degraded && lightformers.length > 0) ? 1 : Infinity}
            resolution={512}
          >
            {lightformers.map((om, idx) => {
              return <LightFormer om={om} key={idx}/>
            })}
          </Environment>
        </>
      }
    </>
  )
}


const LightFormer = ({ om }) => {
  return (
    <Lightformer
      form={om.args.form}
      intensity={om.args.intensity}
      color={om.args.color}
      position={om.args.position}
      rotation={om.args.rotation}
      scale={om.args.scale}
      onUpdate={(self) => {
        if (om.args.lookAt){
          const newVector = new Vector3().copy(om.args.lookAt);
          self.lookAt(newVector);
        }
      }}
     />
  )
}