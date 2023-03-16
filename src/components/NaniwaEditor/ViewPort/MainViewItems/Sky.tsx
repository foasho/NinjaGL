import { IObjectManagement } from "@/engine/core/NaniwaProps"
import { Sky } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useContext, useState } from "react"
import { NaniwaEditorContext } from "../../NaniwaEditorManager";


export const MySky = () => {
    const editor = useContext(NaniwaEditorContext);
    const [sky, setSky] = useState<IObjectManagement>();
    useFrame((_, delta) => {
        if (sky != editor.getSky()){
            setSky(editor.getSky());
        }
    });
    return (<>
        {sky &&
            <Sky
                distance={450000}
                sunPosition={[0, 1, 0]}
                inclination={0}
                azimuth={0}
            />
        }
        </>
    )
}