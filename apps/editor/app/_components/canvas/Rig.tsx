import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { Vector3 } from "three";

let n = new Vector3(0, 0, 0);
export const Rigs = () => {
  const { camera } = useThree();
  const { x, y, z } = camera.position;
  useFrame((state, delta) => {
    n.set(x, y, z);
    easing.damp3(n, [Math.sin(-state.pointer.x) + x, Math.sin(state.pointer.y) + y, z], 0.2, delta);
    state.camera.lookAt(0, 0, 0);
  });
  return <></>;
};
