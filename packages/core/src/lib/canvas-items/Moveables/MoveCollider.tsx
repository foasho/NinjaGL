import React, { useRef } from "react";

import { IObjectManagement } from "../../utils";
import { useFrame } from "@react-three/fiber";
import { Euler, Mesh, Quaternion, Vector3 } from "three";

/**
 * 不可視オブジェクト
 */
type MoveColliderProps = {
  om: IObjectManagement;
};
export const MoveCollider = ({ om }: MoveColliderProps) => {
  const ref = useRef<Mesh>(null);

  useFrame((_state, delta: number) => {
    if (!ref.current) return;
    if (om.args.position && om.args.position !== ref.current.position) {
      /**
       * TODO: 位置の計算
       */
      // // 速度velocityを計算
      // const dv = om.args.position.clone().sub(ref.current.position);
      // if (!om.args.velocity) {
      //   om.args.velocity = new Vector3();
      // }
      // // 時間で割って速度を保存
      // om.args.velocity.copy(dv.divideScalar(delta));

      ref.current.position.copy(om.args.position.clone());
    }
    if (om.args.rotation && om.args.rotation !== ref.current.rotation) {
      /**
       * TODO: 角速度の計算
       */
      // // 現在の回転と目標の回転をクォータニオンに変換
      // const currentQuat = new Quaternion().setFromEuler(ref.current.rotation);
      // const targetQuat = new Quaternion().setFromEuler(om.args.rotation as Euler);

      // // 回転の差分クォータニオンを計算
      // const deltaQuat = targetQuat.multiply(currentQuat.invert());

      // // 差分クォータニオンを時間で割り、角速度クォータニオンを得る
      // deltaQuat.x /= delta;
      // deltaQuat.y /= delta;
      // deltaQuat.z /= delta;
      // deltaQuat.w /= delta;

      // // 角速度を保存
      // if (!om.args.angularVelocity) {
      //   om.args.angularVelocity = new Quaternion();
      // }
      // om.args.angularVelocity.copy(deltaQuat);

      ref.current.rotation.copy(om.args.rotation.clone());
    }
    if (om.args.scale && om.args.scale !== ref.current.scale) {
      ref.current.scale.copy(om.args.scale.clone());
    }
  });

  return (
    <>
      {om.phyType === "box" && (
        <mesh
          ref={ref}
          visible={false}
          position={om.args.position || [0, 0, 0]}
          rotation={om.args.rotation || [0, 0, 0]}
          scale={om.args.scale || 1}
          userData={{ omId: om.id }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      {om.phyType === "sphere" && (
        <mesh
          ref={ref}
          visible={false}
          position={om.args.position || [0, 0, 0]}
          rotation={om.args.rotation || [0, 0, 0]}
          scale={om.args.scale || 1}
          userData={{ omId: om.id }}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      {om.phyType === "capsule" && (
        <mesh
          ref={ref}
          visible={false}
          position={om.args.position || [0, 0, 0]}
          rotation={om.args.rotation || [0, 0, 0]}
          scale={om.args.scale || 1}
          userData={{ omId: om.id }}
        >
          <capsuleGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </>
  );
};
