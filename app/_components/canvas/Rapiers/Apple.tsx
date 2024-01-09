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

export const Apple = ({ children, color = "white", roughness = 0.75 }: ModelProps) => {
  const ref = useRef<Mesh>(null);

  const { nodes, materials } = useGLTF("/top-models/apple.gltf") as any;

  useFrame((_, delta) => {
    if (ref.current && ref.current.material) {
      easing.dampC((ref.current.material as MeshStandardMaterial).color, color, 0.2, delta);
    }
  });

  return (
    // size: 0.17程度 1/0.17 = 5.88
    <group scale={5.88}>
      <mesh ref={ref} castShadow receiveShadow geometry={nodes.Mesh_apple.geometry}>
        <meshStandardMaterial color={color} roughness={roughness} />
        {children}
      </mesh>
      {children ? (
        <>
          <mesh geometry={nodes.Mesh_apple_1.geometry}>{children}</mesh>
          <mesh geometry={nodes.Mesh_apple_2.geometry}>{children}</mesh>
        </>
      ) : (
        <>
          <mesh geometry={nodes.Mesh_apple_1.geometry} material={materials.brown} />
          <mesh geometry={nodes.Mesh_apple_2.geometry} material={materials.green} />
        </>
      )}
    </group>
  );
};
