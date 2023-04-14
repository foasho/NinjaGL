import { IScriptManagement } from '@/core/utils/NinjaProps';
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