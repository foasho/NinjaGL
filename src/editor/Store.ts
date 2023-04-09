import { proxy } from 'valtio';

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