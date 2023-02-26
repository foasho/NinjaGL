import { manualKeyState, useInputControl } from "@/engine/InputControls";
import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager";
import { useFrame } from "@react-three/fiber"
import { useContext } from "react";


export const System = () => {
    const engine = useContext(NaniwaEngineContext);
    const input = useInputControl(engine.deviceType);
    useFrame((_, timeDelta) => {
        const _input = engine.deviceType=="desktop"? input: manualKeyState;
        engine.frameUpdate(timeDelta, _input);
    });
    return (
    <>
    </>
    )
}