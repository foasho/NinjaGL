import { useFrame } from "@react-three/fiber";
import { use, useContext, useEffect, useRef, useState } from "react";
import { NinjaEditorContext } from "../../NinjaEditorManager";
import { IObjectManagement } from "@ninjagl/core";
import { Fog } from "three";
import { useSnapshot } from "valtio";
import { globalStore } from "@/editor/Store";

/**
 * 霧のコンポーネント
 * @returns 
 */
export const FogComponent = () => {
    const state = useSnapshot(globalStore);
    const ref = useRef<Fog>(null);
    const editor = useContext(NinjaEditorContext);
    const [fog, setFog] = useState<IObjectManagement>();

    useEffect(() => {
      setFog(editor.getFog());
      const handleEnvChanged = () => {
        const newFog = editor.getFog();
        if (newFog!== undefined) setFog({...newFog});
        else setFog(undefined);
      }
    }, [editor]);

    return (
        <>
            {fog &&
                <fog ref={ref}/>
            }
        </>
    )
}