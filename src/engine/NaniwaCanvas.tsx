import { NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager"
import { Canvas } from "@react-three/fiber"
import { useContext, useEffect, useState } from "react"
import { Avatar } from "./CanvasItems/Avatar"
import { Camera } from "./CanvasItems/Camera"
import { NEnvironment } from "./CanvasItems/NEnvironment"
import { System } from "./CanvasItems/System"
import { Terrain } from "./CanvasItems/Terrain"

export let isCanvasSetup = false;

export const NaniwaCanvas = () => {
    const [ready, setReady] = useState<boolean>(false)
    const engine = useContext(NaniwaEngineContext)

    useEffect(() => {
        const setup = async () => {
            if (engine && !engine.loadCompleted){
                engine.allSetup();
                // engine.nowLoading = true;
                await engine.importConfigJson();
                // engine.nowLoading = false;
                engine.loadCompleted = true;
                setReady(true);
                return true;
            }
            return false;
        }
        setup().then((res) => {
            isCanvasSetup = res;
        });
        return () => {
            if (ready){
                setReady(false);
            }
        }
    }, []);

    return (
        <>
            <Canvas shadows dpr={window.devicePixelRatio}>
                {(ready && engine) &&
                    <>
                        <System/>
                        <Terrain/>
                        <Avatar/>
                        <Camera/>
                    </>
                }
                {engine &&
                    <>
                        <NEnvironment/>
                    </>
                }
            </Canvas>
        </>
    )
}