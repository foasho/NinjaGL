import { useInputControl } from "@/core/utils/InputControls";
import { NinjaEngineContext } from "@/core/utils/NinjaEngineManager";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { Mesh, Object3D, Vector3 } from "three";


export interface IAvatarProps { }

export const Avatar = () => {
  const ref = useRef<Mesh>();
  const engine = useContext(NinjaEngineContext);
  const { camera } = useThree();

  // 初回ロード時にAvatarObjectをセットする 
  useEffect(() => {
    if (engine.getAvatarObject()) {
      // 必ずカメラをセットしてからAvatarセットする
      engine.setAvatarCamera(camera);
      engine.setAvatar(
        ref.current
      );
    }
  }, []);

  return (
    <>
      {engine.getAvatarObject() &&
        <mesh ref={ref}>
          <primitive object={engine.getAvatarObject().object} />
        </mesh>
      }
      <OrbitControls 
        makeDefault={true} 
      />
    </>
  )
}