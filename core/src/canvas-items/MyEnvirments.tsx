import { Environment, Lightformer } from "@react-three/drei";
import React, { useContext, useState, useEffect } from "react";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "../utils/NinjaProps";

const EnvirmentComponent = (om: IObjectManagement) => {
  return (
    <>
      <Environment
        preset={om.args.preset}
        background={om.args.background}
        blur={om.args.blur}
      >
      </Environment>
    </>
  )
}

export const MyEnvirments = () => {
  const engine = useContext(NinjaEngineContext);
  const environment = engine ? engine.getEnvironment() : null;
  return (
    <>
      {environment &&
        <EnvirmentComponent {...environment} />
      }
    </>
  )
}

export const LightFormers = () => {
  const engine = useContext(NinjaEngineContext);
  const [lightFormers, setLightFormers] = useState(engine.getLightFormers());
  useEffect(() => {
    setLightFormers(engine.getLightFormers());
  }, [engine]);
  return (
    <>
      {lightFormers.length > 0 &&
        <>
        <Environment resolution={512}>
          {lightFormers.map((om, index) => {
            return <MyLightFormer om={om} key={index} />
          })
          }
        </Environment>
        </>
      }
    </>
  )
}

const MyLightFormer = ({ om }) => {
  return (
    <Lightformer 
      form={om.args.form}
      position={om.args.position}
      rotation={om.args.rotation}
      scale={om.args.scale? om.args.scale : [1, 1]}
      intensity={om.args.intensity}
      color={om.args.color}
    />
  )
}