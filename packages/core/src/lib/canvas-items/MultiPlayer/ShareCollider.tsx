import React from "react";
import { useNinjaEngine } from "../../hooks";
import { MultiPlayerColliderTunnel } from "../../utils";

/**
 * MultiPlayer用のCollider
 */
export const ShareColliders = () => {
  const { shareGrp } = useNinjaEngine();

  return (
    <group ref={shareGrp}>
      <MultiPlayerColliderTunnel.Out />
    </group>
  );
};
