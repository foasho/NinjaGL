import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager"
import { Canvas } from "@react-three/fiber"
import { useContext, useEffect, useState } from "react"
import { Avatar } from "./CanvasItems/Avatar"
import { Camera } from "./CanvasItems/Camera"
import { NEnvironment } from "./CanvasItems/NEnvironment"
import { System } from "./CanvasItems/System"
import { Terrain } from "./CanvasItems/Terrain"
import { NaniwaUI } from "./NaniwaUI"
import { LoadProcessing } from "./UIItems/LoadProcessing"

export const NaniwaCanvas = () => {
  const [ready, setReady] = useState<boolean>(false)
  const engine = useContext(NaniwaEngineContext)

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

  return (
    <>
      <Canvas shadows dpr={window.devicePixelRatio}>
        {(ready && engine) &&
          <>
            <System />
            <Terrain />
            <Avatar />
            <Camera />
          </>
        }
        {engine &&
          <>
            <NEnvironment />
          </>
        }
      </Canvas>
      {(ready && engine) &&
        <NaniwaUI />
      }
      <LoadProcessing />
    </>
  )
}
