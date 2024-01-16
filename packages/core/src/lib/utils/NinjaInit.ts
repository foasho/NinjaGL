import { MathUtils, Vector3, Euler } from "three";
import {
  IConfigParams,
  IScriptManagement,
  IObjectManagement,
} from "./NinjaProps";

export const InitMobileConfipParams: IConfigParams = {
  projectName: "NinjaGL",
  physics: true,
  dpr: 1,
  multi: true,
  isApi: true,
  isDebug: false,
};

export const InitTabletConfipParams: IConfigParams = {
  projectName: "NinjaGL",
  physics: true,
  dpr: [1, 1.5],
  multi: true,
  isApi: true,
  isDebug: false,
};

const isBrowser = typeof window !== "undefined";
const dpr = isBrowser ? window.devicePixelRatio : 1;
export const InitDesktopConfipParams: IConfigParams = {
  projectName: "NinjaGL",
  physics: true,
  dpr: dpr,
  multi: true,
  isApi: true,
  isDebug: false,
};

export const InitScriptManagement: IScriptManagement = {
  id: MathUtils.generateUUID(),
  name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
  type: "script",
  script: "",
};

export const InitOM = (): IObjectManagement => {
  return {
    id: MathUtils.generateUUID(),
    name: "box01",
    type: "three",
    args: {
      type: "box",
      position: new Vector3(0, 0, 0),
      rotation: new Euler(0, 0, 0),
      scale: new Vector3(1, 1, 1),
      materialData: {
        type: "standard",
        value: "#4785FF",
      },
      castShadow: true,
      receiveShadow: true,
    },
    physics: true,
    phyType: "box",
    visibleType: "auto",
    visible: true,
  };
};
