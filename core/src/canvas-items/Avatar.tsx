import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { useThree } from "@react-three/fiber";
import React, { useState } from "react";
import { useContext, useEffect, useRef } from "react";
import { IObjectManagement } from "../utils/NinjaProps";

/**
 * アバター表示
 * アバターが場合は通常のカメラを表示する
 * @returns 
 */
export const Avatar = () => {
  const ref = useRef<any>();
  const engine = useContext(NinjaEngineContext);
  const [avatar, setAvatar] = useState<IObjectManagement>();
  const { camera } = useThree();
  const objRef = useRef<any>();
  // 初回ロード時にAvatarObjectをセットする 
  useEffect(() => {
    setAvatar(engine.getAvatar());
    const handleAvatarChanged = () => {
      setAvatar(engine.getAvatar());
    }
    engine.onAvatarChanged(handleAvatarChanged);
    return () => {
      engine.offAvatarChanged(handleAvatarChanged);
    }
  }, []);

  // AvatarObjectが変更された場合にカメラをセットする
  useEffect(() => {
    if (avatar && ref.current) {
      if (avatar.args.position){
        ref.current.position.copy(avatar.args.position.clone());
      }
      if (avatar.args.rotation){
        ref.current.rotation.copy(avatar.args.rotation.clone());
      }
      if (avatar.args.scale){
        ref.current.scale.copy(avatar.args.scale.clone());
      }
      engine.setAvatar(ref.current);
      engine.setAvatarCamera(camera);
    }
  }, [avatar]);


  return (
    <>
      {avatar &&
        <mesh ref={ref} layers={0}>
          <primitive
            ref={objRef}
            object={avatar.object}
          />
        </mesh>
      }
    </>
  )
}