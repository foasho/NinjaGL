import React, { useRef } from "react";
import { Group } from "three";
import { OMPlayer } from "./OMPlayer";
import { ColliderTunnel } from "../../utils";
import { useThree } from "@react-three/fiber";
import { InputControlProvider, useNinjaEngine } from "../../hooks";

export const ColliderField = () => {
  const { bvhGrp: grp } = useNinjaEngine();
  const { raycaster } = useThree();
  raycaster.firstHitOnly = true;

  return (
    <>
      <OMPlayer grp={grp} />
      <group ref={grp} renderOrder={0}>
        <ColliderTunnel.Out />
      </group>
    </>
  );
};
