import { proxy } from "valtio";

/**
 * 地形メーカー操作状態管理
 */
interface ILandScapeStore {
  brush: "normal" | "flat" | "paint";
  color: string;
  active: {
    current: boolean;
  };
  power: number;
  wireFrame: boolean;
  radius: number;
  colorBlend: number;
  init: () => void;
}
export const landScapeStore = proxy<ILandScapeStore>({
  brush: "normal",
  color: "#00ff00",
  active: { current: false },
  power: 0.1,
  wireFrame: false,
  radius: 3,
  colorBlend: 0.75,
  init: () => {
    landScapeStore.brush = "normal";
    landScapeStore.color = "#00ff00";
    landScapeStore.active = { current: false };
    landScapeStore.power = 0.1;
    landScapeStore.wireFrame = false;
    landScapeStore.radius = 3;
    landScapeStore.colorBlend = 0.75;
  },
});
