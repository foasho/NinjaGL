import { Environment, Lightformer } from "@react-three/drei"
import { IObjectManagement } from "../utils/NinjaProps"
import React, { useContext, useEffect, useState } from "react";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";

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
