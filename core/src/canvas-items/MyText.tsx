import * as React from "react";
import { Text } from "@react-three/drei";
import { IObjectManagement } from "../utils/NinjaProps";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";

export const MyTexts = () => {
  const engine = React.useContext(NinjaEngineContext);
  const [texts, setTexts] = React.useState<IObjectManagement[]>([]);
  React.useEffect(() => {
    if (!engine) return;
    setTexts(engine.getTexts());
  }, [engine]);
  return (
    <>
      {texts.map((om) => {
        return <MyText om={om} key={om.id}/>
        })
      }
    </>
  )
}

const MyText = ({ om }) => {
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
      <Text font={""} ref={ref}>
        {om.args.content as string}
      </Text>
    </>
  )
}

