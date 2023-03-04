import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"


export const NaniwaEditor = () => {
    return (
        <div style={{ height: "100%" }}>
            <Canvas camera={ { position: [5, 5, -10] } }>
                <Environment preset="dawn" blur={0.7} background />
                <OrbitControls/>
                <gridHelper args={[4096, 4096]}/>
            </Canvas>
        </div>
    )
}