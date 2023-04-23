import { Text3D } from "@react-three/drei"
import React, { useContext, useEffect, useRef } from "react"
import { IObjectManagement } from "../utils/NinjaProps"
import { NinjaEngineContext } from "../utils/NinjaEngineManager";

export const MyText3Ds = () => {
  const engine = useContext(NinjaEngineContext);
  const [text3ds, setText3ds] = React.useState<IObjectManagement[]>([]);
  useEffect(() => {
    setText3ds(engine.getTexts3D());
  }, [engine]);
  return (
    <>
      {text3ds.map((om) => {
        return <MyText3D om={om} key={om.id}/>
        })
      }
    </>
  )
}

const MyText3D = ({ om }) => {
  const ref = useRef<any>();
  useEffect(() => {
    if (ref.current) {
      if (om.args.position) {
        ref.current.position.copy(om.args.position);
      }
      if (om.args.rotation) {
        ref.current.rotation.copy(om.args.rotation);
      }
      if (om.args.scale) {
        ref.current.scale.copy(om.args.scale);
      }
    }
  }, [])
  return (
    <>
      <Text3D font={""} ref={ref}>
        {om.args.content}
      </Text3D>
    </>
  )
}