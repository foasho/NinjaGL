import { Suspense, memo } from "react";

import { Canvas } from "@react-three/fiber";
import dynamic from "next/dynamic";

import { Loading3D } from "@/commons/Loading3D";
import { ViewHelperControls } from "@/helpers/ViewHelperControls";

import { UICanvas } from "./MainViewUIs/UICanvas";

const SceneItems = dynamic(() => import("./MainViewItems/SceneItems").then((mod) => mod.SceneItems), { ssr: false });

const _MainViewer = () => {
  return (
    <div className='relative h-full bg-[#e2e2e2]'>
      <Canvas id='mainviewcanvas' className='relative h-full'>
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
