import { useInputControl } from "@/engine/core/InputControls";
import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { Mesh, Object3D, Vector3 } from "three";


export interface IAvatarProps { }

export const Avatar = () => {
  const ref = useRef<Mesh>();
  const engine = useContext(NaniwaEngineContext)

  // 初回ロード時にAvatarObjectをセットする 
  useEffect(() => {
    if (engine.getAvatarObject()) {
      engine.setAvatar(ref.current);
    }
  }, []);

  return (
    <>
      {engine.getAvatarObject() &&
        <mesh ref={ref}>
          <primitive object={engine.getAvatarObject().object} />
        </mesh>
      }
    </>
  )
}