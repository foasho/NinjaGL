import { useGLTF } from '@react-three/drei';

type ModelProps = {
  children?: React.ReactNode;
};
export const OculusRift = ({ children }: ModelProps) => {
  const { nodes, materials } = useGLTF('/top-models/oculus_rift.glb') as any;
  return (
    <group dispose={null} scale={1.5}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.081}>
        <group position={[-4.381, -3.052, -2.581]}>
          {children ? (
            <>
              <mesh geometry={nodes.Object_3.geometry}>{children}</mesh>
              <mesh geometry={nodes.Object_4.geometry}>{children}</mesh>
            </>
          ) : (
            <>
              <mesh geometry={nodes.Object_3.geometry} material={materials.base} />
              <mesh geometry={nodes.Object_4.geometry} material={materials.checker} />
            </>
          )}
          <mesh geometry={nodes.Object_5.geometry} material={materials.checker2} />
          <mesh geometry={nodes.Object_6.geometry} material={materials.dots} />
          <mesh geometry={nodes.Object_7.geometry} material={materials.foam} />
          <mesh geometry={nodes.Object_8.geometry} material={materials.logo} />
          <mesh geometry={nodes.Object_9.geometry} material={materials.screen} />
        </group>
      </group>
    </group>
  );
};
