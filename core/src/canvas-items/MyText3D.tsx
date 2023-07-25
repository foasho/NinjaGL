import { Text3D } from "@react-three/drei"
import * as React from "react"
import { IObjectManagement } from "../utils/NinjaProps"
import { NinjaEngineContext } from "../utils/NinjaEngineManager";

export const MyText3Ds = () => {
  const engine = React.useContext(NinjaEngineContext);
  const [text3ds, setText3ds] = React.useState<IObjectManagement[]>([]);
  React.useEffect(() => {
    if (!engine) return;
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
  const ref = React.useRef<any>();
  React.useEffect(() => {
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
      {/** @ts-ignore */}
      <Text3D font={""} ref={ref}>
        {om.args.content}
      </Text3D>
    </>
  )
}