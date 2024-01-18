"use client";
import { Clone, OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

type ModelViewerProps = {
  url: string;
  className?: string;
};
export const ModelViewer = ({ url, className = "" }: ModelViewerProps) => {
  const { scene } = useGLTF(url);

  return (
    <Canvas className={className}>
      <OrbitControls />
      <Stage>
        <Clone object={scene} />
      </Stage>
    </Canvas>
  );
};
