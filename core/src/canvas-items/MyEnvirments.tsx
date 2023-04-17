import { Environment } from "@react-three/drei";
import { useContext } from "react";
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