import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager";
import { Environment, Sky, SpotLight, SpotLightShadow } from "@react-three/drei"
import { useContext } from "react"
import { MathUtils } from "three";

export interface INEnvironmentProps {}

export const NEnvironment = () => {
    const engine = useContext(NaniwaEngineContext);
    const sky = engine? engine.getSky(): null;
    const lights = engine? engine.getLights(): [];
    return (
        <>
            {/* <Environment preset="dawn" background blur={0.7} /> */}
            <SpotLight 
                position={engine.worldSize} 
                angle={MathUtils.degToRad(45)}
                distance={engine.worldSize[0] * 2}
                intensity={engine.worldSize[0] / 8}
                castShadow 
                color={'#fadcb9'} 
                volumetric={false}
            >
            </SpotLight>
            <pointLight
                position={[0, 50, 0]}
                intensity={0.8}
                distance={100}
                castShadow
            />
            <ambientLight
                color={'#fadcb9'}
                intensity={0.5}
            />
            <Sky 
                distance={450000} 
                sunPosition={[0, 1, 0]} 
                inclination={0} 
                azimuth={0.25}
            />
        </>
    )
}