import { manualKeyState, useInputControl } from "@/engine/Core/InputControls";
import { NinjaEngineContext } from "@/engine/Core/NinjaEngineManager";
import { useFrame } from "@react-three/fiber"
import { useContext } from "react";


export const System = () => {
  const engine = useContext(NinjaEngineContext);
  const input = useInputControl(engine.deviceType ? engine.deviceType : "desktop");
  useFrame((_, timeDelta) => {
    if (engine) {
      const _input = engine.deviceType == "desktop" ? input : manualKeyState;
      engine.frameUpdate(timeDelta, _input);
    }
  });
  return (
    <>
    </>
  )
}