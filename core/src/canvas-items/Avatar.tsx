import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { useThree } from "@react-three/fiber";
import * as React from "react";
import { IObjectManagement } from "../utils/NinjaProps";
import { Object3D } from "three";

/**
 * アバター表示
 * アバターが場合は通常のカメラを表示する
 * @returns 
 */
export const Avatar = () => {
  const ref = React.useRef<any>();
  const engine = React.useContext(NinjaEngineContext);
  const [avatar, setAvatar] = React.useState<IObjectManagement>();
  const { camera } = useThree();
  const objRef = React.useRef<any>();
  // 初回ロード時にAvatarObjectをセットする 
  React.useEffect(() => {
    if (!engine) return;
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
  React.useEffect(() => {
    if (avatar && ref.current && engine) {
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
            object={avatar.object as Object3D}
          />
        </mesh>
      }
    </>
  )
}