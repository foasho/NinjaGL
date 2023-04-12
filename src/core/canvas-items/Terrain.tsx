import { NinjaEngineContext } from "@/core/NinjaEngineManager"
import { useContext, useEffect, useState } from "react"
import { Object3D } from "three";
import { IObjectManagement } from "../utils/NinjaProps";

export interface ITerrainProps { }

export const Terrain = () => {
  const engine = useContext(NinjaEngineContext)
  const [terrainObject, setTerrainObject] = useState<IObjectManagement>();
  useEffect(() => {
    if (engine.getTerrain()) {
      setTerrainObject(engine.getTerrain())
    }
    return () => {
      setTerrainObject(undefined);
    }
  }, []);
  console.log("layrNum: " + terrainObject?.layerNum);
  return (
    <>
      {terrainObject &&
        <>
          <mesh layers={terrainObject.layerNum}>
            <primitive object={terrainObject.object} />
          </mesh>
        </>
      }
    </>
  )
}