import { proxy } from "valtio";

/**
 * 地形メーカー操作状態管理
 */
interface ILandScapeStore {
  type: "create" | "edit";
  landMode: "edit" | "view";
  brush: "normal" | "flat" | "paint";
  color: string;
  active: {
    current: boolean;
  };
  power: number;
  wireFrame: boolean;
  radius: number;
  init: () => void;
}
export const landScapeStore = proxy<ILandScapeStore>({
  landMode: "view",
  type: "create",
  brush: "normal",
  color: "#00ff00",
  active: { current: false },
  power: 0.1,
  wireFrame: false,
  radius: 3,
  init: () => {
    landScapeStore.landMode = "view";
    landScapeStore.type = "create";
    landScapeStore.brush = "normal";
    landScapeStore.color = "#00ff00";
    landScapeStore.active = { current: false };
    landScapeStore.power = 0.1;
    landScapeStore.wireFrame = false;
    landScapeStore.radius = 3;
  },
});
