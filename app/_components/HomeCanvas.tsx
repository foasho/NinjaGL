"use client";
import { Canvas } from "@react-three/fiber";
import { Lighting } from "./canvas/LIghting";
import { Rigs } from "./canvas/Rig";

export const HomeCanvas = () => {

  return (
    <Canvas shadows>
      <Lighting />
      <Rigs />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Canvas>
  )
}