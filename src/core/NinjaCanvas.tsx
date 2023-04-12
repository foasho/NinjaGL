import { NinjaEngineContext } from "@/core/NinjaEngineManager";
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

interface INinjaCanvasProps {
  children?: React.ReactNode;
  canvasProps?: RenderProps<HTMLCanvasElement>;
}
export const NinjaCanvas = (props: INinjaCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>();
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
        ref={canvasRef} 
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