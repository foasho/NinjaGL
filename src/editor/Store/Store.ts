import type { Selection } from "@nextui-org/react";

import { IConfigParams, IScriptManagement } from "@ninjagl/core";
import { AnimationClip, Vector3 } from "three";
import { proxy } from "valtio";

import { globalEditorStore } from "./editor";

export const HomeCameraPosition = new Vector3(5, 5, -5);

/**
 * Editor操作状態管理
 */
interface IEditorStore {
  mode: Selection; // 選択モードとランドスケープモード "select" | "landscape"
  currentId: string | null;
  editorFocus: boolean;
  pivotControl: boolean;
  hiddenList: string[];
  init: (e?: MouseEvent) => void;
  setMode: (mode: Selection) => void;
}
export const editorStore = proxy<IEditorStore>({
  mode: new Set(["select"]) as Selection,
  currentId: null,
  editorFocus: false,
  pivotControl: false,
  hiddenList: [],
  init: (e?: MouseEvent) => {
    editorStore.currentId = null;
    editorStore.editorFocus = false;
    editorStore.pivotControl = false;
  },
  setMode: (mode: Selection) => {
    editorStore.mode = mode;
  },
});

/**
 * コンテンツブラウザ操作状態管理
 */
interface IGlobalContentStore {
  currentUrl: string | null;
  currentType: string | null;
  catchFocus: boolean;
  cameraPosition: Vector3;
}
export const globalContentStore = proxy<IGlobalContentStore>({
  currentUrl: null,
  currentType: null,
  catchFocus: false,
  cameraPosition: HomeCameraPosition,
});

/**
 * UI操作状態管理
 */
interface IGlobalUIStore {
  currentId: string | null;
  editorFocus: boolean;
  moveableControl: boolean;
  hiddenList: string[];
  init: () => void;
}
export const globalUIStore = proxy<IGlobalUIStore>({
  currentId: null,
  editorFocus: false,
  moveableControl: false,
  hiddenList: [],
  init: () => {
    globalUIStore.currentId = null;
    globalUIStore.editorFocus = false;
    globalUIStore.moveableControl = false;
  },
});

/**
 * スクリプト操作状態管理
 */
interface IGlobalScriptStore {
  currentSM: IScriptManagement | null;
  init: () => void;
  setScript: (script: string) => void;
}
export const globalScriptStore = proxy<IGlobalScriptStore>({
  currentSM: null,
  init: () => {
    globalScriptStore.currentSM = null;
  },
  setScript: (script: string) => {
    if (globalScriptStore.currentSM) {
      globalScriptStore.currentSM.script = script;
    }
  },
});

/**
 * マテリアル操作状態管理
 */

/**
 * Addon操作状態管理
 */
interface IGlobalAddonStore {
  params: { [key: string]: any };
  init: () => void;
}
export const globalAddonStore = proxy<IGlobalAddonStore>({
  params: {},
  init: () => {
    globalAddonStore.params = {};
  },
});

export interface IGlobalPlayerStore {
  type: "avatar" | "other" | "npc";
  height: number;
  selectAnim: string;
  animMapper: { [key: string]: string };
  animations: AnimationClip[];
  init: () => void;
}
export const globalPlayerStore = proxy<IGlobalPlayerStore>({
  type: "avatar",
  height: 1.7,
  selectAnim: "",
  animMapper: {},
  animations: [],
  init: () => {
    globalPlayerStore.type = "avatar";
    globalPlayerStore.height = 1.7;
    globalPlayerStore.selectAnim = "";
    globalPlayerStore.animMapper = {};
    globalPlayerStore.animations = [];
  },
});

/**
 * Engine内Config設定
 */
export const globalConfigStore = proxy<IConfigParams>({
  physics: true, // 物理エンジンの有無
  multi: true, // マルチプレイヤーの有無
  isApi: true, // API(サーバーサイド)の有無
  isDebug: true, // デバッグモードかどうか // デバックプレイ時の補助線等
  projectName: "NinjaGL", // プロジェクト名
});

export const setInitConfig = (config: IConfigParams) => {
  globalConfigStore.physics = config.physics;
  globalConfigStore.multi = config.multi;
  globalConfigStore.isApi = config.isApi;
  globalConfigStore.isDebug = config.isDebug;
  globalConfigStore.projectName = config.projectName;
  // projectNameはglobalEditorStore側も変更する
  globalEditorStore.projectName = config.projectName;
};
