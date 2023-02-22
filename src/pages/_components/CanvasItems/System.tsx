import { useInputControl } from "@/engine/InputControls";
import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager";
import { useFrame } from "@react-three/fiber"
import { useContext } from "react";


export const System = () => {
    const engine = useContext(NaniwaEngineContext);
    const input = useInputControl();
    useFrame((_, timeDelta) => {
        engine.frameUpdate(timeDelta, input);
    });
    return (
    <>
    </>
    )
}