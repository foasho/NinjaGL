import type { Mesh, AnimationClip } from "three";
import type { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    [key: string]: Mesh;
  },
};

export type { GLTFResult };