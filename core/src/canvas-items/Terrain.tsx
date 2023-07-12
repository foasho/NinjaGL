import React, { useContext, useEffect, useState } from "react"
import { Object3D } from "three";
import { IObjectManagement } from "../utils/NinjaProps";
import { useNinjaEngine } from "../hooks/useNinjaEngine";

export interface ITerrainProps { }

export const Terrain = () => {
  const { oms } = useNinjaEngine();
  return (
    <>
      {oms.map((om: IObjectManagement, index: number) => {
        if (om.args.type === "terrain") {
          return (
            <mesh>
              <primitive object={om.object} />
            </mesh>
          )
        }
      })}
    </>
  )
}