import { IConfigParams, IScriptManagement } from '@ninjagl/core';
import { AnimationClip, Vector3 } from 'three';
import { proxy } from 'valtio';

export const HomeCameraPosition = new Vector3(5, 5, -5);

/**
 * Editor操作状態管理
 */
interface IEditorStore {
  mode: 'select' | 'landscape';
  currentId: string | null;
  editorFocus: boolean;
  pivotControl: boolean;
  hiddenList: string[];
  init: () => void;
}
export const editorStore = proxy<IEditorStore>({
  mode: 'select',
  currentId: null,
  editorFocus: false,
  pivotControl: false,
  hiddenList: [],
  init: () => {
    editorStore.currentId = null;
    editorStore.editorFocus = false;
    editorStore.pivotControl = false;
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

/**
 * 地形メーカー操作状態管理
 */
interface ILandScapeStore {
  type: 'create' | 'edit';
  mode: 'edit' | 'view';
  brush: 'normal' | 'flat' | 'paint';
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
  mode: 'view',
  type: 'create',
  brush: 'normal',
  color: '#00ff00',
  active: { current: false },
  mapSize: 128,
  mapResolution: 128,
  power: 0.1,
  wireFrame: false,
  radius: 10,
  init: () => {
    landScapeStore.mode = 'view';
    landScapeStore.type = 'create';
    landScapeStore.brush = 'normal';
    landScapeStore.color = '#00ff00';
    landScapeStore.active = { current: false };
    landScapeStore.mapSize = 128;
    landScapeStore.mapResolution = 128;
    landScapeStore.power = 0.1;
    landScapeStore.wireFrame = false;
    landScapeStore.radius = 10;
  },
});

export interface IGlobalPlayerStore {
  type: 'avatar' | 'other' | 'npc';
  height: number;
  selectAnim: string;
  animMapper: { [key: string]: string };
  animations: AnimationClip[];
  init: () => void;
}
export const globalPlayerStore = proxy<IGlobalPlayerStore>({
  type: 'avatar',
  height: 1.7,
  selectAnim: '',
  animMapper: {},
  animations: [],
  init: () => {
    globalPlayerStore.type = 'avatar';
    globalPlayerStore.height = 1.7;
    globalPlayerStore.selectAnim = '';
    globalPlayerStore.animMapper = {};
    globalPlayerStore.animations = [];
  },
});

/**
 * Engine内Config設定
 */
export const globalConfigStore = proxy<IConfigParams>({
  physics: true, // 物理エンジンの有無
  dpr: undefined, // デバイスピクセル比
  multi: true, // マルチプレイヤーの有無
  isApi: true, // API(サーバーサイド)の有無
  isDebug: true, // デバッグモードかどうか // デバックプレイ時の補助線等
  projectName: 'NinjaGL', // プロジェクト名
});
