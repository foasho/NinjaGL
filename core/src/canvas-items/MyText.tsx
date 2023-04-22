import React, { useContext, useEffect, useRef } from "react";
import { Text } from "@react-three/drei";
import { IObjectManagement } from "../utils/NinjaProps";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";

export const MyTexts = () => {
  const engine = useContext(NinjaEngineContext);
  const [texts, setTexts] = React.useState<IObjectManagement[]>([]);
  useEffect(() => {
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
      <Text font={""} ref={ref}>
        {om.args.content}
      </Text>
    </>
  )
}

