import { NinjaEngineContext } from "../utils/NinjaEngineManager";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useContext, useEffect, useRef, useState } from "react";
import { Avatar } from "../canvas-items/Avatar";
import { SkyComponents } from "../canvas-items/Sky";
import { StaticObjects } from "../canvas-items/StaticObjects";
import { System } from "../canvas-items/System";
import { Terrain } from "../canvas-items/Terrain";
import { NinjaUI } from "./NinjaUI";
import { LoadProcessing } from "../ui-items/LoadProcessing";
import { Lights } from "../canvas-items/Lights";
import { INinjaGLProps } from "./NinjaGL";
import { ThreeObjects } from "../canvas-items/ThreeObjects";
import { Cameras } from "../canvas-items/Camera";
import { proxy } from "valtio";
import { JSONTree } from 'react-json-tree';
import { MyEnvirments } from "../canvas-items/MyEnvirments";
import { Preload } from "@react-three/drei";
import { MyEffects } from "../canvas-items/MyEffects";
import { MyTexts } from "../canvas-items/MyText";
import { MyText3Ds } from "../canvas-items/MyText3D";

export const NinjaCanvas = (props: INinjaGLProps) => {
  const engine = useContext(NinjaEngineContext);

  const [engineState, setEngineState] = useState({
    nowLoading: false,
    loadCompleted: false,
    loadingPercentages: 0,
  });

  useEffect(() => {
    if (!engine) return;
    setEngineState({
      nowLoading: engine.nowLoading,
      loadCompleted: engine.loadCompleted,
      loadingPercentages: engine.loadingPercentages,
    });
  }, [engine]);

  let dpr: number | [number, number] = window.devicePixelRatio || 1;
  if (engine && engine.config.dpr) {
    dpr = engine.config.dpr;
  }

  return (
    <>
      <Canvas 
        id="ninjagl" 
        shadows 
        dpr={dpr}
        gl={{ 
          antialias: engine? engine.config.antialias: false, 
          alpha: engine? engine.config.alpha: false, 
          logarithmicDepthBuffer: engine? engine.config.logarithmicDepthBuffer: false,
        }}
        {...props.canvasProps}
      >
        <Suspense fallback={null}>
          {(engineState.loadCompleted && engine) &&
            <>
              <System />
              <Terrain />
              <Avatar />
              <StaticObjects/>
              <Lights/>
              <SkyComponents />
              <ThreeObjects/>
              <Cameras/>
              <MyEnvirments/>
              <MyEffects/>
              <MyTexts/>
              <MyText3Ds/>
            </>
          }
          {props.children && props.children}
          <Preload all />
        </Suspense>
      </Canvas>
      {(engineState.loadCompleted) &&
        <NinjaUI />
      }
      {engine &&
        <LoadProcessing
          loadingPercentages={engineState.loadingPercentages}
          nowLoading={engineState.nowLoading}
          loadCompleted={engineState.loadCompleted}
        />
      }
      {engine && engine.config.isDebug && engineState.loadCompleted &&
        <>
          <DebugComponent />
        </>
      }
    </>
  )
}

const DebugComponent = () => {
  const treeRef = useRef<any>({});
  const engine = useContext(NinjaEngineContext);
  useEffect(() => {
    const interval = setInterval(() => {
      myFrame(1000 / 5);
    }, 1000 / 5);
    return () => clearInterval(interval);
  }, [engine])

  const myFrame = (timeDelta: number) => {
    if (!engine) return;
    engine.debugFrameUpdate(timeDelta, {});
    treeRef.current = engine.getDebugTree();
  }

  return (
    <>
      <div style={{ position: "absolute", bottom: 0, zIndex: 9999  }}>
        <JSONTree data={treeRef} />;
      </div>
    </>
  )
}

interface IEngineState {
}
export const globalEngineStore = proxy<IEngineState>({})