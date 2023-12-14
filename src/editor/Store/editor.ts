import { proxy } from 'valtio';

type ViewSelect = "mainview" | "debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor";
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
};
export const globalEditorStore = proxy<IEditorStore>({
  projectName: "",
  autoSave: false,
  viewSelect: "mainview",
  selectSubNav: "ui",
  uiMode: false,
  appBar: true,
  sideBar: true,
  isMd: true,
});