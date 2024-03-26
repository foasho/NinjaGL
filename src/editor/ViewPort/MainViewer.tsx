import { memo, Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";

import { Loading3D } from "@/commons/Loading3D";
import { ViewHelperControls } from "@/helpers/ViewHelperControls";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { UICanvas } from "./MainViewUIs/UICanvas";

const SceneItems = dynamic(() => import("./MainViewItems/SceneItems").then((mod) => mod.SceneItems), { ssr: false });

const _MainViewer = () => {
  const { canvasRef } = useNinjaEditor();
  return (
    <div className='relative h-full bg-[#e2e2e2]'>
      <Canvas
        id='mainviewcanvas'
        onContextMenu={(e) => e.preventDefault()}
        className='relative h-full'
        gl={{ preserveDrawingBuffer: true }}
        ref={canvasRef}
        shadows
      >
        <Suspense fallback={<Loading3D />}>
          <SceneItems />
        </Suspense>
      </Canvas>
      <ViewHelperControls />
      <UICanvas />
    </div>
  );
};

export const MainViewer = memo(_MainViewer);
