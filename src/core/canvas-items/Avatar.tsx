import { NinjaEngineContext } from "../NinjaEngineManager";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { Mesh, Object3D, Vector3 } from "three";
import { CameraControl } from "./MoveableCamera";


export interface IAvatarProps { }

/**
 * アバター表示
 * アバターが場合は通常のカメラを表示する
 * @returns 
 */
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
      {engine.getAvatarObject() ?
        <mesh ref={ref} layers={0}>
          <primitive object={engine.getAvatarObject().object} />
        </mesh>
        :
        <>
          <CameraControl cameraSpeed={10} cameraFar={500} />
        </>
      }
    </>
  )
}