import { useEffect, useState } from "react";
import { TerrainMakerCanvas } from "./_components/TerrainMaker/TerrainMakerCanvas";
import { TerrainMakerContext, TerrainMakerManager} from "./_components/TerrainMaker/TerrainMakerManager";
import { TerrainMakerUI } from "./_components/TerrainMaker/TerrainMakerUI";

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