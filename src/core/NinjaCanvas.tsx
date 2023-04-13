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


export const NinjaCanvas = (props: INinjaGLProps) => {
  const [ready, setReady] = useState<boolean>(false);
  const engine = useContext(NinjaEngineContext);

  const [engineState, setEngineState] = useState({
    nowLoading: false,
    loadCompleted: false,
    loadingPercentages: 0,
  });

  useEffect(() => {
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
    </>
  )
}