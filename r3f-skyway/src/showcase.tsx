import React from "react";
import { Canvas } from "@react-three/fiber";
import { IInputMovement } from "./hooks/InputControl";
import { Euler, Vector3 } from "three";
import { useSkyway } from "./hooks/useSkyway";

const SkywayCanvas = () => {
    return (
        <Canvas>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <mesh name="attach">
                <boxBufferGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="hotpink" />
            </mesh>
            <SkywayComponent />
        </Canvas>
    );
};

const SkywayComponent = () => {
    // ここでSkywayを利用
    // useSkyway({ enabled: true, attach: "attach" });

    // // ここでSkywayのデータをuseFrameにオーバーライドして取得できるようにしたい
    // useSWFrame(( state, delta, subscribers: { input: IInputMovement, position: Vector3, rotation: Euler,  } ) => {
    //     // Continue MyCode...
    // });
    return (
        <>
        </>
    )
};

export default SkywayCanvas;