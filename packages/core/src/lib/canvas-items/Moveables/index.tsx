import React from "react";
import { useNinjaEngine } from "../../hooks";
import { MoveCollider } from "./MoveCollider";
import { useFrame } from "@react-three/fiber";
import { MultiPlayerColliderTunnel } from "../../utils";

export const Moveable = () => {
  const { moveGrp: grp, oms, updateCollisions } = useNinjaEngine();

  // om.moveable かつ om.physics が true のオブジェクトを取得
  const moveables = oms.filter((om) => om.moveable && om.physics);

  useFrame((state, delta) => {
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      updateCollisions(delta/steps);
    }
  });

  return (
    <>
      <group ref={grp}>
        {moveables.map((om) => (
          <MoveCollider om={om} key={`${om.id}-moveable`} />
        ))}
      </group>
    </>
  );
};
