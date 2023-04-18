import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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
  const editor = useContext(NinjaEditorContext);
  const [environment, setEnvironment] = useState<IObjectManagement>();
  const [lightformers, setLightformers] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    setEnvironment(editor.getEnvironment());
    setLightformers(editor.getLightformers());
    const handleEnvChanged = () => {
      setEnvironment({...editor.getEnvironment()});
    }
    editor.onEnvChanged(handleEnvChanged);
    return () => {
      editor.offEnvChanged(handleEnvChanged);
    }
  }, [editor]);
  return (
    <>
      {environment &&
        <>
          <Environment 
            preset={environment.args.preset}
            background={environment.args.background}
            blur={environment.args.blur}
          >
            {lightformers.map((om, index) => {
              return <FightFormer om={om} key={index} />
            })}
          </Environment>
        </>
      }
      {!environment &&
        <>
          {lightformers.map((om, index) => {
            return <FightFormer om={om} key={index} />
          })}
        </>
      }
    </>
  )
}

const FightFormer = ({ om }) => {
  return (
  <>
    <Lightformer
      form={om.args.form}
      target={om.args.target? om.args.target.data : [0, 0, 0]}
      scale={om.args.scale? om.args.scale : [1, 1]}
      intensity={om.args.intensity}
      color={om.args.color}
     />
  </>
  )
}