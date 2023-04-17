import { useFrame } from "@react-three/fiber";
import { use, useContext, useEffect, useRef, useState } from "react";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "ninja-core";
import { Fog } from "three";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

/**
 * 霧のコンポーネント
 * @returns 
 */
export const FogComponent = () => {
    const state = useSnapshot(globalStore);
    const ref = useRef<Fog>();
    const editor = useContext(NinjaEditorContext);
    const [fog, setFog] = useState<IObjectManagement>();
    useEffect(() => {
        setFog(editor.getFog());
    }, [])
    useFrame((_, delta) => {
        if (fog !== editor.getFog()){
            setFog(editor.getFog());
        }
        if (ref.current && fog.args){
            if (fog.args.color && fog.args.color !== ref.current.color){
                ref.current.color = fog.args.color;
            }
            if (fog.args.near && fog.args.near !== ref.current.near){
                ref.current.near = fog.args.near;
            }
            if (fog.args.far && fog.args.far !== ref.current.far){
                ref.current.far = fog.args.far;
            }
        }
    })
    return (
        <>
            {fog &&
                <fog ref={ref}/>
            }
        </>
    )
}