import { IConfigParams, IScriptManagement } from 'ninja-core';
import { AnimationClip, Group, Mesh, Object3D } from 'three';
import { proxy } from 'valtio';

/**
 * オブジェクト操作状態管理
 */
interface IGlobalStore {
  currentId: string|null;
  editorFocus: boolean;
  pivotControl: boolean;
  hiddenList: string[];
  init: () => void;
}
export const globalStore = proxy<IGlobalStore>(
  { 
    currentId: null, 
    editorFocus: false,
    pivotControl: false,
    hiddenList: [],
    init: () => {
      globalStore.currentId = null;
      globalStore.editorFocus = false;
      globalStore.pivotControl = false;
    }
  }
);

/**
 * コンテンツブラウザ操作状態管理
 */
interface IGlobalContentStore {
  currentUrl: string|null;
  currentType: string|null;
  catchFocus: boolean;
}
export const globalContentStore = proxy<IGlobalContentStore>(
  {
    currentUrl: null,
    currentType: null,
    catchFocus: false
  }
);


/**
 * UI操作状態管理
 */
interface IGlobalUIStore {
  currentId: string|null;
  editorFocus: boolean;
  moveableControl: boolean;
  hiddenList: string[];
  init: () => void;
}
export const globalUIStore = proxy<IGlobalUIStore>(
  {
    currentId: null,
    editorFocus: false,
    moveableControl: false,
    hiddenList: [],
    init: () => {
      globalUIStore.currentId = null;
      globalUIStore.editorFocus = false;
      globalUIStore.moveableControl = false;
    }
  }
);

/**
 * スクリプト操作状態管理
 */
interface IGlobalScriptStore {
  currentSM: IScriptManagement|null;
  init: () => void;
  setScript: (script: string) => void;
}
export const globalScriptStore = proxy<IGlobalScriptStore>(
  {
    currentSM: null,
    init: () => {
      globalScriptStore.currentSM = null;
    },
    setScript: (script: string) => {
      if (globalScriptStore.currentSM) {
        globalScriptStore.currentSM.script = script;
      }
    }
  }
);

/**
 * マテリアル操作状態管理
 */



/**
 * Addon操作状態管理
 */
interface IGlobalAddonStore {
  params: {[key: string]: any};
  init: () => void;
}
export const globalAddonStore = proxy<IGlobalAddonStore>(
  {
    params: {},
    init: () => {
      globalAddonStore.params = {};
    }
  }
);

/**
 * 地形メーカー操作状態管理
 */
interface IGlobalTerrainStore {
  type: "create"|"edit";
  mode: "edit"|"view";
  brush: "normal"|"flat"|"paint";
  color: string;
  isMouseDown: boolean;
  mapSize: number;
  mapResolution: number;
  power: number;
  wireFrame: boolean;
  radius: number;
  init: () => void;
}
export const globalTerrainStore = proxy<IGlobalTerrainStore>(
  {
    mode: "view",
    type: "create",
    brush: "normal",
    color: "#00ff00",
    isMouseDown: false,
    mapSize: 128,
    mapResolution: 128,
    power: 0.1,
    wireFrame: false,
    radius: 10,
    init: () => {
      globalTerrainStore.mode = "view";
      globalTerrainStore.type = "create";
      globalTerrainStore.brush = "normal";
      globalTerrainStore.color = "#00ff00";
      globalTerrainStore.isMouseDown = false;
      globalTerrainStore.mapSize = 128;
      globalTerrainStore.mapResolution = 128;
      globalTerrainStore.power = 0.1;
      globalTerrainStore.wireFrame = false;
      globalTerrainStore.radius = 10;
    }
  }
);

export interface IGlobalPlayerStore {
  type: "avatar"|"other"|"npc";
  height: number;
  selectAnim: string;
  animMapper: {[key: string]: string};
  animations: AnimationClip[];
  init: () => void;
}
export const globalPlayerStore = proxy<IGlobalPlayerStore>({
  type: "avatar",
  height: 1.7,
  selectAnim: undefined,
  animMapper: {},
  animations: [],
  init: () => {
    globalPlayerStore.type = "avatar";
    globalPlayerStore.height = 1.7;
    globalPlayerStore.selectAnim = undefined;
    globalPlayerStore.animMapper = {};
    globalPlayerStore.animations = [];
  }
});

/**
 * Engine内設定
 */
export const globalConfigStore = proxy<IConfigParams>({
  physics: "octree", // 物理エンジンの種類("octree" | "bvh" | "none")
  logarithmicDepthBuffer: false, // ログ深度バッファを有効にするか
  alpha: false, // アルファチャンネルを有効にするか
  autoScale: true, // デバイスによって自動スケールさせるか
  antialias: false, // アンチエイリアスを有効にするか
  shadowResolution: 256, // Shadow解像度レベル(128 | 256 | 512 | 1024)
  mapsize: 64, // マップサイズ
  layerGridNum: 8, // レイヤーグリッド数
  lodDistance: 25, // LODの切り替え距離
  dpr: undefined, // デバイスピクセル比
  viewGridLength: 3, // ビューグリッドの長さ
  octreeDepth: 5, // オクトリーツリーの深さ
});