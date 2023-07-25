import { Environment, Lightformer } from "@react-three/drei"
import * as React from "react";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { IObjectManagement } from "utils/NinjaProps";

export const LightFormers = () => {
  const engine = React.useContext(NinjaEngineContext);
  const [lightFormers, setLightFormers] = React.useState<IObjectManagement[]>([]);
  React.useEffect(() => {
    if(engine) setLightFormers(engine.getLightFormers());
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
    // @ts-ignore
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
