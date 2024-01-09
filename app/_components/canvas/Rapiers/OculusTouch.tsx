import { useGLTF } from "@react-three/drei";

type ModelProps = {
  children?: React.ReactNode;
};
export const OculusTouch = ({ children }: ModelProps) => {
  const { nodes, materials } = useGLTF("/top-models/oculus_touch.glb") as any;

  return (
    <group scale={1}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.014}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          {children ? (
            <mesh geometry={nodes["Right_Controller_for_Quest_and_Rift_S_����������������_0"].geometry}>
              {children}
            </mesh>
          ) : (
            <mesh
              geometry={nodes["Right_Controller_for_Quest_and_Rift_S_����������������_0"].geometry}
              material={materials.material}
            />
          )}
        </group>
      </group>
    </group>
  );
};
