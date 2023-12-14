import { useGLTF } from '@react-three/drei';

type ModelProps = {
  children?: React.ReactNode;
};

export const XBox = ({ children }: ModelProps) => {
  const { nodes, materials } = useGLTF('/top-models/xbox.glb') as any;

  return (
    // size: 0.17程度 1/0.17 = 5.88
    <group scale={0.1}>
      {children ? (
        <mesh geometry={nodes['Object_5'].geometry} castShadow>
          {children}
        </mesh>
      ) : (
        <mesh geometry={nodes['Object_5'].geometry} material={materials['material']} castShadow />
      )}
    </group>
  );
};
