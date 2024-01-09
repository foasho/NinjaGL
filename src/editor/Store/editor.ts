import { proxy } from "valtio";

type ViewSelect = "mainview" | "debugplay" | "playereditor" | "scripteditor" | "shadereditor";
type SelectSubNav = "ui" | "shader" | "script" | "texture";
interface IEditorStore {
  projectName: string | null;
  autoSave: boolean;
  viewSelect: ViewSelect;
  selectSubNav: SelectSubNav;
  uiMode: boolean;
  appBar: boolean;
  sideBar: boolean;
  isMd: boolean;
  uiGridNum: number;
  worldGridSize: number;
  worldSize: number;
  cameraFar: number;
  cameraSpeed: number;
  viewDistance: number;
  isGrid: boolean;
  isWorldHelper: boolean;
  isGizmo: boolean;
  showCanvas: boolean;
}
export const globalEditorStore = proxy<IEditorStore>({
  projectName: "",
  autoSave: false,
  viewSelect: "mainview",
  selectSubNav: "ui",
  uiMode: false,
  appBar: true,
  sideBar: true,
  isMd: true,
  uiGridNum: 8,
  worldGridSize: 8,
  worldSize: 32,
  cameraFar: 1000,
  cameraSpeed: 1,
  viewDistance: 50,
  isGrid: false,
  isWorldHelper: true,
  isGizmo: true,
  showCanvas: true,
});
