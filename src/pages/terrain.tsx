import { TerrainMakerCanvas } from "@/components/TerrainMaker/TerrainMakerCanvas";
import { TerrainMakerContext, TerrainMakerManager } from "@/components/TerrainMaker/TerrainMakerManager";
import { TerrainMakerUI } from "@/components/TerrainMaker/TerrainMakerUI";
import { useEffect, useState } from "react";

const TerrainMakerComponent = () => {
    const [terrainManager, setTerrainManager] = useState<TerrainMakerManager>();
    useEffect(() => {
        setTerrainManager(new TerrainMakerManager());
        return () => {
            setTerrainManager(null);
        }
    }, [])
    return (
        <>
            <TerrainMakerContext.Provider value={terrainManager}>
                {terrainManager &&
                <>
                    <div>
                        <TerrainMakerUI/>
                    </div>
                    <div style={{ height: "100vh" }} onContextMenu={() => {return false}}>
                        <TerrainMakerCanvas/>
                    </div>
                </>
                }
            </TerrainMakerContext.Provider>
        </>
    )
}

export default TerrainMakerComponent;