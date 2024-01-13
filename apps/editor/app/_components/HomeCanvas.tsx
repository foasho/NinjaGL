"use client";
import { Suspense } from "react";

import { Environment, SoftShadows } from "@react-three/drei";
import dynamic from "next/dynamic";

import { CenterRapier } from "./canvas/CenterRapier";
import { Effects } from "./canvas/Effects";
import { Lighting } from "./canvas/LIghting";

const View = dynamic(() => import("@/commons/View").then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
});

export const HomeCanvas = () => {
  return (
    <View className='h-full w-full'>
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
    </View>
  );
};
