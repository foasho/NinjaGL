import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { useThree } from "@react-three/fiber";
import React from "react";
import { useContext, useEffect, useRef } from "react";

export interface IAvatarProps { }

/**
 * アバター表示
 * アバターが場合は通常のカメラを表示する
 * @returns 
 */
export const Avatar = () => {
  const ref = useRef<any>();
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
        <mesh ref={ref} layers={0}>
          <primitive object={engine.getAvatarObject().object} />
        </mesh>
      }
    </>
  )
}