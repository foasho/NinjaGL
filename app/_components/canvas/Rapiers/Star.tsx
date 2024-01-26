import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Mesh, MeshStandardMaterial } from "three";

type ModelProps = {
  children?: React.ReactNode;
  color?: string;
  roughness?: number;
};

export const Star = ({ children, color = "white", roughness = 0.75 }: ModelProps) => {
  const ref = useRef<Mesh>(null);

  const { nodes, materials } = useGLTF("/top-models/star.gltf") as any;

  useFrame((_, delta) => {
    if (ref.current && ref.current.material) {
      easing.dampC((ref.current.material as MeshStandardMaterial).color, color, 0.2, delta);
    }
  });

  return (
    // size: 0.17程度 1/0.17 = 5.88
    <group>
      {children ? (
        <>
          <mesh geometry={nodes.star.geometry}>{children}</mesh>
        </>
      ) : (
        <>
          <mesh geometry={nodes.star.geometry} material={materials["Yellow.030"]} />
        </>
      )}
    </group>
  );
};
