import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PointLight } from "three";

export const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight castShadow position={[0, 5, 0]} intensity={10} />
      <PointerLighting />
      <rectAreaLight intensity={3} position={[-2, 3, 2]} width={30} height={30} castShadow />
    </>
  );
};

const PointerLighting = () => {
  const ref = useRef<PointLight>(null);

  useFrame(({ pointer, viewport }, delta) => {
    if (ref.current) {
      ref.current.position.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);
    }
  });

  return <pointLight ref={ref} intensity={10} color='#43D9D9' castShadow />;
};
