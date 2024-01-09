import { proxy } from "valtio";

/**
 * 地形メーカー操作状態管理
 */
interface ILandScapeStore {
  type: "create" | "edit";
  mode: "edit" | "view";
  brush: "normal" | "flat" | "paint";
  color: string;
  active: {
    current: boolean;
  };
  mapSize: number;
  mapResolution: number;
  power: number;
  wireFrame: boolean;
  radius: number;
  init: () => void;
}
export const landScapeStore = proxy<ILandScapeStore>({
  mode: "view",
  type: "create",
  brush: "normal",
  color: "#00ff00",
  active: { current: false },
  mapSize: 128,
  mapResolution: 128,
  power: 0.1,
  wireFrame: false,
  radius: 10,
  init: () => {
    landScapeStore.mode = "view";
    landScapeStore.type = "create";
    landScapeStore.brush = "normal";
    landScapeStore.color = "#00ff00";
    landScapeStore.active = { current: false };
    landScapeStore.mapSize = 128;
    landScapeStore.mapResolution = 128;
    landScapeStore.power = 0.1;
    landScapeStore.wireFrame = false;
    landScapeStore.radius = 10;
  },
});
