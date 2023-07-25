// import { manualKeyState, useInputControl } from "../utils/InputControls";
import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { useFrame, RootState } from "@react-three/fiber"
import * as React from "react";


export const System = () => {
  const engine = React.useContext(NinjaEngineContext);
  // const input = useInputControl(engine.deviceType ? engine.deviceType : "desktop");
  useFrame((state: RootState, timeDelta: number) => {
    if (engine && engine.loadCompleted) {
      // const _input = engine.deviceType == "desktop" ? input : manualKeyState;
      // engine.frameUpdate(state, timeDelta, _input);
    }
  });
  return (
    <>
    </>
  )
}