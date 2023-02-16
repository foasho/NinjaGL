import { Environment } from "@react-three/drei"

export interface INEnvironmentProps {}

export const NEnvironment = () => {
    return (
        <>
            <Environment preset="dawn" background blur={0.7} />
            <pointLight position={[10, 10, -10]} castShadow />
            <directionalLight position={[100, 100, 100]} intensity={0.8} castShadow />
        </>
    )
}