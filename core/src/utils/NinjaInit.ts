import { MathUtils } from "three";
import { IConfigParams, IScriptManagement } from "./NinjaProps";

export const InitMobileConfipParams: IConfigParams = {
  physics: "octree",
  logarithmicDepthBuffer: false,
  shadowResolution: 256,
  alpha: false,
  antialias: false,
  autoScale: true,
  mapsize: 64,
  layerGridNum: 8,
  lodDistance: 25,
  dpr: 1,
  octreeDepth: 5,
  viewGridLength: 4,
};

export const InitTabletConfipParams: IConfigParams = {
  physics: "octree",
  shadowResolution: 512,
  alpha: false,
  logarithmicDepthBuffer: false,
  antialias: true,
  autoScale: true,
  mapsize: 256,
  layerGridNum: 32,
  lodDistance: 50,
  dpr: [1, 1.5],
  octreeDepth: 6,
  viewGridLength: 4,
};

const isBrowser = typeof window !== "undefined";
const dpr = isBrowser ? window.devicePixelRatio : 1;
export const InitDesktopConfipParams: IConfigParams = {
  physics: "octree",
  shadowResolution: 1024,
  alpha: false,
  logarithmicDepthBuffer: true,
  antialias: true,
  autoScale: true,
  mapsize: 1024,
  layerGridNum: 64,
  lodDistance: 100,
  dpr: dpr,
  octreeDepth: 7,
  viewGridLength: 4,
};

export const InitScriptManagement: IScriptManagement = {
  id: MathUtils.generateUUID(),
  name: "nonname-script" + MathUtils.generateUUID().substring(0, 6),
  type: "script",
  script: "",
}
