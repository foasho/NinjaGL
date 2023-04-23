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
      engine.setAvatar(ref.current);
      engine.setAvatarCamera(camera);
      // 最後にポジションのずれをセット(調査中)
      // if (avatar.args.position && objRef.current) {
      //   objRef.current.position.copy(
      //     avatar.args.position
      //   );
      // }
    }
  }, [avatar]);


  return (
    <>
      {avatar &&
        <mesh ref={ref} layers={0}>
          {/* <mesh> */}
            <primitive
              ref={objRef}
              object={avatar.object}
            />
          {/* </mesh> */}
        </mesh>
      }
    </>
  )
}