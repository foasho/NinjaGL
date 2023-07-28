import { useThree } from "@react-three/fiber";
import * as React from "react";
import { IObjectManagement } from "../utils/NinjaProps";
import { Object3D } from "three";
import { useNinjaEngine } from "../hooks/useNinjaEngine";

/**
 * Player表示
 * Playerが場合は通常のカメラを表示する
 * @returns 
 */
export const OMPlayer = () => {
  const ref = React.useRef<any>();
  const engine = useNinjaEngine();
  const { camera } = useThree();
  const objRef = React.useRef<any>();

  const player = React.useMemo(() => {
    if (!engine) return null;
    const avatar = engine.oms.find((o: IObjectManagement) => o.type === "avatar");
    return avatar? avatar : null;
  }, [engine]);

  React.useEffect(() => {
    if (player && ref.current && engine) {
      if (player.args.position){
        ref.current.position.copy(player.args.position.clone());
      }
      if (player.args.rotation){
        ref.current.rotation.copy(player.args.rotation.clone());
      }
      if (player.args.scale){
        ref.current.scale.copy(player.args.scale.clone());
      }
    }
  }, [player]);


  return (
    <>
      {player &&
        <group ref={ref} layers={0}>
          <primitive
            ref={objRef}
            object={player.object as Object3D}
          />
        </group>
      }
    </>
  )
}