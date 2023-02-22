import { useInputControl } from "@/engine/InputControls";
import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useRef, useState } from "react";
import { Mesh, Object3D } from "three";


export interface IAvatarProps{}

export const Avatar = () => {
    const ref = useRef<Mesh>();
    const engine = useContext(NaniwaEngineContext)

    // 初回ロード時にAvatarObjectをセットする 
    useEffect(() => {
        if (engine.getAvatarObject()){
            engine.setAvatar(ref.current);
            console.log("AvatarSetを確認する");
            ref.current.position.set(0, 10, 0);
        }
    }, []);

    return (
        <>
            {/* {engine.getAvatarObject() && */}
                <>
                    <mesh ref={ref}>
                        <primitive object={engine.getAvatarObject().object} />
                    </mesh>
                </>
            {/* } */}
        </>
    )
}