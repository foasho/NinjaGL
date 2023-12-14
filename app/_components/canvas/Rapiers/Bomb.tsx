import { useGLTF } from '@react-three/drei';

type ModelProps = {
  children?: React.ReactNode;
};

export const Bomb = ({ children }: ModelProps) => {
  const { nodes, materials } = useGLTF('/top-models/bomb.gltf') as any;

  return (
    <group scale={0.75}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        {children ? (
          <>
            <mesh geometry={nodes.Sphere008.geometry}>{children}</mesh>
            <mesh geometry={nodes.Sphere008_1.geometry}>{children}</mesh>
            <mesh geometry={nodes.Sphere008_2.geometry}>{children}</mesh>
          </>
        ) : (
          <>
            <mesh geometry={nodes.Sphere008.geometry} material={materials['Black.022']} />
            <mesh geometry={nodes.Sphere008_1.geometry} material={materials['Beige.006']} />
            <mesh geometry={nodes.Sphere008_2.geometry} material={materials['Yellow.015']} />
          </>
        )}
      </group>
    </group>
  );
};
