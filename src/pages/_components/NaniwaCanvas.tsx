import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager"
import { Canvas } from "@react-three/fiber"
import { useContext, useEffect, useState } from "react"
import { PCFShadowMap, PCFSoftShadowMap } from "three"
import { Avatar } from "./CanvasItems/Avatar"
import { Camera } from "./CanvasItems/Camera"
import { NEnvironment } from "./CanvasItems/NEnvironment"
import { System } from "./CanvasItems/System"
import { Terrain } from "./CanvasItems/Terrain"

export const NaniwaCanvas = () => {
    const [ready, setReady] = useState<boolean>(false)
    const engine = useContext(NaniwaEngineContext)

    useEffect(() => {
        (async () => {
            if (!engine.loadCompleted){
                engine.allSetup();
                let jsonPath = "savedata/default.json";
                await engine.importConfigJson(jsonPath);
            }
            setReady(engine.loadCompleted)
        })();
        return () => {
            if (ready){
                setReady(false);
            }
        }
    }, [engine.loadCompleted]);

    return (
        <>
            <Canvas shadows dpr={window.devicePixelRatio}>
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