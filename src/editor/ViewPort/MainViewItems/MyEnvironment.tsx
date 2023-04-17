import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { use, useContext, useEffect, useRef, useState } from "react";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "ninja-core";
import { Fog } from "three";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

/**
 * Environment
 * @returns 
 */
export const MyEnviroment = () => {
  const state = useSnapshot(globalStore);
  const ref = useRef<any>();
  const editor = useContext(NinjaEditorContext);
  const [environment, setEnvironment] = useState<IObjectManagement>();
  useEffect(() => {
    setEnvironment(editor.getEnvironment());
  }, [])
  useFrame((_, delta) => {
    if (environment !== editor.getEnvironment()) {
      setEnvironment(editor.getEnvironment());
    }
  })
  return (
    <>
      {environment &&
        <>
          <Environment 
            preset={environment.args.preset}
            background={environment.args.background}
            blur={environment.args.blur}
          />
        </>
      }
    </>
  )
}