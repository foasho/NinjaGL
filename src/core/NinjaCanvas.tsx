import { NinjaEngineContext } from "./NinjaEngineManager";
import { Canvas, useThree, RenderProps } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { Avatar } from "./canvas-items/Avatar";
import { SkyComponents } from "./canvas-items/Sky";
import { StaticObjects } from "./canvas-items/StaticObjects";
import { System } from "./canvas-items/System";
import { Terrain } from "./canvas-items/Terrain";
import { NinjaUI } from "./NinjaUI";
import { LoadProcessing } from "./ui-items/LoadProcessing";
import { Lights } from "./canvas-items/Lights";
import { INinjaGLProps } from "./NinjaGL";
import { ThreeObjects } from "./canvas-items/ThreeObjects";
import { Cameras } from "./canvas-items/Camera";
import { proxy } from "valtio";
import { JSONTree } from 'react-json-tree';

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

  return (
    <>
      <Canvas 
        id="ninjagl" 
        shadows 
        dpr={window.devicePixelRatio}
        {...props.canvasProps}
      >
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
          </>
        }
        {props.children && props.children}
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
      {engine && engine.config.isDebug &&
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