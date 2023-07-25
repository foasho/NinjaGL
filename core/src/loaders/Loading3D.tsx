import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Vector3 } from "three";

interface ILoading3D {
  position?: [number, number, number] | Vector3;
  scale?: [number, number, number] | Vector3 | number;
  color?: string;
  isLighting?: boolean;
}

export const Loading3D = (
  {
    position,
    scale = 0.2,
    color = '#00FFFF',
    isLighting = false,
  }: ILoading3D
) => {

  const ref = React.useRef<Group>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      // ref.current内のchildrenのメッシュを時間に応じて大きくしたり小さくしたりしてローディングを表現する
      const children = ref.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child instanceof Mesh) {
          // i毎にScaleをずらしてWaveを表現する
          child.scale.setScalar(Math.sin(state.clock.elapsedTime * 10 + i) * 0.1 + 0.9);
        }
      }
    }
  });

  return (
    <>
      <group
        ref={ref}
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={scale}
      >
        <mesh
          position={[-0.3, 0, 0]}
        >
          <cylinderGeometry
            attach={'geometry'}
            args={
              [0.1, 0.1, 0.1, 32]
            }
          />
          <meshStandardMaterial
            attach={'material'}
            color={color}
          />
        </mesh>
        <mesh
          position={[0, 0, 0]}
        >
          <cylinderGeometry
            attach={'geometry'}
            args={
              [0.1, 0.1, 0.1, 32]
            }
          />
          <meshStandardMaterial
            attach={'material'}
            color={color}
          />
        </mesh>
        <mesh
          position={[0.3, 0, 0]}
        >
          <cylinderGeometry
            attach={'geometry'}
            args={
              [0.1, 0.1, 0.1, 32]
            }
          />
          <meshStandardMaterial
            attach={'material'}
            color={color}
          />
        </mesh>
      </group>
      {isLighting && <CommonLight />}
    </>
  )
}

const CommonLight = () => {

  return (
    <>
      <ambientLight
        intensity={0.5}
      />
      <directionalLight
        position={[0, 10, 0]}
      />
    </>
  )
}