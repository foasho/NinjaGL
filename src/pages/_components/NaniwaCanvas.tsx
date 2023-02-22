import { useInputControl } from "@/engine/InputControls"
import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager"
import { Canvas, useFrame } from "@react-three/fiber"
import { useContext, useEffect, useState } from "react"
import { Avatar } from "./CanvasItems/Avatar"
import { Camera } from "./CanvasItems/Camera"
import { NEnvironment } from "./CanvasItems/NEnvironment"
import { System } from "./CanvasItems/System"
import { Terrain } from "./CanvasItems/Terrain"

export const NaniwaCanvas = () => {
    const [ready, setReady] = useState<boolean>(false)
    const engine = useContext(NaniwaEngineContext)
    const input = useInputControl();
    useEffect(() => {
        (async () => {
            if (!engine.loadCompleted){
                let jsonPath = "savedata/default.json";
                await engine.importConfigJson(jsonPath);
            }
            setReady(engine.loadCompleted)
        })();
    }, [engine.loadCompleted])

    return (
        <>
            <Canvas shadows>
                {ready &&
                    <>
                        <System/>
                        <Terrain/>
                        <Avatar/>
                        <Camera/>
                    </>
                }
                <NEnvironment/>
            </Canvas>
        </>
    )
}