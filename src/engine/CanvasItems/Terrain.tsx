import { NaniwaEngineContext } from "@/engine/Core/NaniwaEngineManager"
import { useContext, useEffect, useState } from "react"
import { Object3D } from "three";

export interface ITerrainProps { }

export const Terrain = () => {
  const engine = useContext(NaniwaEngineContext)
  const [terrainObject, setTerrainObject] = useState<Object3D>();
  useEffect(() => {
    if (true) {
      setTerrainObject(engine.getTerrain().object)
    }
  }, [])
  return (
    <>
      {terrainObject &&
        <>
          <mesh>
            <primitive object={terrainObject} />
          </mesh>
        </>
      }
    </>
  )
}