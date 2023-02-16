import { Canvas } from "@react-three/fiber"
import { NEnvironment } from "./CanvasItems/NEnvironment"

export const NaniwaCanvas = () => {
    
    return (
        <>
            <Canvas shadows>
                <mesh>
                    <boxBufferGeometry/>
                    <meshStandardMaterial/>
                </mesh>
                <NEnvironment/>
            </Canvas>
        </>
    )
}