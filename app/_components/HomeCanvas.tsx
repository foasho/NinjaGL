"use client";
import { Suspense } from "react";
import { Environment, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { CenterRapier } from "./canvas/CenterRapier";
import { Effects } from "./canvas/Effects";
import { Lighting } from "./canvas/LIghting";

export const HomeCanvas = () => {
  return (
    <Canvas className='absolute left-0 top-0 h-full w-full' shadows>
      <Lighting />
      <Suspense fallback={null}>
        <Effects />
        <CenterRapier />
      </Suspense>
      <Environment preset='dawn' blur={0.8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow castShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color='black' />
      </mesh>
      <SoftShadows />
      <color attach='background' args={["#504F56"]} />
    </Canvas>
  );
};
