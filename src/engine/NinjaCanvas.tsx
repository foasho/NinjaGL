import { NinjaEngineContext } from "@/engine/Core/NinjaEngineManager"
import { Canvas, useThree } from "@react-three/fiber"
import { useContext, useEffect, useRef, useState } from "react"
import { Avatar } from "./CanvasItems/Avatar"
import { NEnvironment } from "./CanvasItems/NEnvironment"
import { StaticObjects } from "./CanvasItems/StaticObjects"
import { System } from "./CanvasItems/System"
import { Terrain } from "./CanvasItems/Terrain"
import { NinjaUI } from "./NinjaUI"
import { LoadProcessing } from "./UIItems/LoadProcessing"

export const NinjaCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [ready, setReady] = useState<boolean>(false)
  const engine = useContext(NinjaEngineContext)

  useEffect(() => {
    const setup = async () => {
      if (engine && !engine.loadCompleted) {
        engine.allSetup();
        await engine.importConfigJson();
        setReady(true);
      }
    }
    setup();
    return () => {
      if (ready) {
        setReady(false);
      }
    }
  }, []);

  const onResize = () => {
    const cv = document.getElementById("ninjagl") as HTMLCanvasElement;
    const width = cv.width;
    const height = cv.height;
    if (canvasRef.current){
    }
    console.log(width, height);
    console.log(cv.clientTop, cv.clientLeft);
    engine.setCanvasSize(width, height);
}
  
  useEffect(() => {
    const viewer = document.getElementById("Ninjaviewer");
    const rect = viewer.getBoundingClientRect();
    engine.setCanvasSize(rect.width, rect.height);
    engine.setCanvasPos(rect.left, rect.top);
  }, [false]);

  return (
    <>
      <Canvas id="ninjagl" ref={canvasRef} shadows dpr={window.devicePixelRatio}>
        {(ready && engine) &&
          <>
            <System />
            <Terrain />
            <Avatar />
            <StaticObjects/>
          </>
        }
        {engine &&
          <>
            <NEnvironment />
          </>
        }
      </Canvas>
      {(ready && engine) &&
        <NinjaUI />
      }
      <LoadProcessing />
    </>
  )
}