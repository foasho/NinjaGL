import React from "react";
import { Avatar } from "../canvas-items/Avatar";
import { SkyComponents } from "../canvas-items/Sky";
import { StaticObjects } from "../canvas-items/StaticObjects";
import { System } from "../canvas-items/System";
import { Terrain } from "../canvas-items/Terrain";
import { Lights } from "../canvas-items/Lights";
import { ThreeObjects } from "../canvas-items/ThreeObjects";
import { Cameras } from "../canvas-items/Camera";
import { MyEnvirments } from "../canvas-items/MyEnvirments";
import { MyEffects } from "../canvas-items/MyEffects";
import { MyTexts } from "../canvas-items/MyText";
import { MyText3Ds } from "../canvas-items/MyText3D";

export const NinjaCanvasElements = ({ children  }) => {
  return (
    <>
      <System />
      <Terrain />
      <Avatar />
      <StaticObjects/>
      <Lights/>
      <SkyComponents />
      <ThreeObjects/>
      <Cameras/>
      <MyEnvirments/>
      <MyEffects/>
      <MyTexts/>
      <MyText3Ds/>
      {children}
    </>
  )
}