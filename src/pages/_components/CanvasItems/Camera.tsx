

import { useInputControl } from "@/engine/InputControls";
import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { Mesh, Object3D } from "three";


export const Camera = () => {
    const ref = useRef<Mesh>();
    const engine = useContext(NaniwaEngineContext)
    const { camera } = useThree();
    useEffect(() => {
        engine.setAvatarCamera(camera);
    }, [])
    return (
        <>
            <OrbitControls makeDefault={true}/>
        </>
    )
}