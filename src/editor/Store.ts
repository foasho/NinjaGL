import { proxy } from 'valtio';

/**
 * オブジェクト操作状態管理
 */
interface IGlobalStore {
  currentId: string;
  editorFocus: boolean;
  pivotControl: boolean;
  init: () => void;
}
export const globalStore = proxy<IGlobalStore>(
  { 
    currentId: null, 
    editorFocus: false,
    pivotControl: false,
    init: () => {
      globalStore.currentId = null;
      globalStore.editorFocus = false;
      globalStore.pivotControl = false;
    }
  }
);


/**
 * UI操作状態管理
 */
interface IGlobalUIStore {
  currentId: string;
  editorFocus: boolean;
  moveableControl: boolean;
  init: () => void;
}
export const globalUIStore = proxy<IGlobalUIStore>(
  {
    currentId: null,
    editorFocus: false,
    moveableControl: false,
    init: () => {
      globalUIStore.currentId = null;
      globalUIStore.editorFocus = false;
      globalUIStore.moveableControl = false;
    }
  }
);

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