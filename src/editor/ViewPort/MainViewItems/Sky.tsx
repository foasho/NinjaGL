import { IObjectManagement } from "@ninjagl/core"
import { Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useEffect, useState } from "react"
import { NinjaEditorContext } from "../../NinjaEditorManager";


export const MySky = () => {
    const editor = useContext(NinjaEditorContext);
    const [sky, setSky] = useState<IObjectManagement>();
    useEffect(() => {
        setSky(editor.getSky());
        const handleSkyChanged = () => {
            setSky(editor.getSky()?{...editor.getSky()}: undefined);
        }
        editor.onSkyChanged(handleSkyChanged);
        return () => {
            editor.offSkyChanged(handleSkyChanged);
        }
    }, [editor]);
    return (<>
        {sky &&
            <Sky
                distance={450000} // Camera distance (default=450000)
                sunPosition={[0, 1, 0]}
                inclination={0}
                azimuth={0}
            />
        }
        </>
    )
}