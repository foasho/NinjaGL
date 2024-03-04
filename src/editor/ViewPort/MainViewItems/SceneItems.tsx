import { memo } from "react";
import { useSnapshot } from "valtio";

import { globalEditorStore } from "@/editor/Store/editor";
import { EditorHelper } from "@/helpers/EditorHelper";
import { ViewHelper } from "@/helpers/ViewHelper";

import { FogComponent } from "./Fog";
import { LandScape } from "./LandScape";
import { MyLights } from "./Lights";
import { MyEffects } from "./MyEffects";
import { MyEnviroment } from "./MyEnvironment";
import { MyText3Ds } from "./MyText3Ds";
import { MyTexts } from "./MyTexts";
import { NPCs } from "./NPCs";
import { StaticObjects } from "./Objects";
import { Avatar } from "./Player";
import { MySky } from "./Sky";
import { ThreeObjects } from "./Three";
import { MyWaters } from "./Waters";

const _SceneItems = () => {
  const { showCanvas } = useSnapshot(globalEditorStore);
  return (
    <group visible={showCanvas}>
      <MyLights />
      <StaticObjects />
      <Avatar />
      <MySky />
      <ThreeObjects />
      <FogComponent />
      <MyEnviroment />
      <MyTexts />
      <MyText3Ds />
      <MyEffects />
      <MyWaters />
      <NPCs />
      <LandScape />
      <ViewHelper />
      <EditorHelper />
    </group>
  );
};

export const SceneItems = memo(_SceneItems);
