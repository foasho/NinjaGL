import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement, NJCFile } from '@ninjagl/core';
import { Euler, Group, Object3D, Vector3 } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { initThirdPersonTemplate } from '@/utils/initOms';

/**
 * コンテンツブラウザの操作モード
 */
export enum ECBMode {
  POSITION = 'position',
  ROTATION = 'rotation',
  SCALE = 'scale',
}

/**
 * コンテンツブラウザのファイル種別
 */
export enum ECBSelectType {
  GLTF = 'gltf',
  MP3 = 'mp3',
  JS = 'js',
  GLSL = 'glsl',
  IMAGE = 'image',
  TER = 'ter',
  AVT = 'avt',
  CAMERA = 'camera',
}

/**
 * プレイヤー
 */
export interface IPlayerManager {
  type: 'avatar';
  selectAnim: string;
  height: number;
  animations: [];
  object: Group;
  animMapper: { [key: string]: string };
  sounds: any[];
  args: any;
}

type NinjaEditorProp = {
  oms: IObjectManagement[];
  ums: IUIManagement[];
  tms: ITextureManagement[];
  sms: IScriptManagement[];
  transformDecimal: number;
  mode: ECBMode;
  gltfViewerObj: Object3D | null;
  wireFrameColor: string;
  fileSelect: string;
  assetRoute: string;
  contentsSelect: boolean;
  contentsSelectType: ECBSelectType | null;
  contentsSelectPath: string | null;
  ready: boolean;
  initialize: () => void;
  setCamera: (camera: OrbitControlsImpl) => void;
  setPlayerManager: (pm: IPlayerManager) => void;
  setSelectPlayerAnimation: (anim: string) => void;
  undo: () => void;
  redo: () => void;
  setName: (id: string, name: string) => void;
  setVisibleType: (id: string, visibleType: 'force' | 'auto') => void;
  setVisible: (id: string, visible: boolean) => void;
  setPosition: (id: string, position: Vector3) => void;
  getPosition: (id: string) => Vector3;
  setRotation: (id: string, rotation: Euler) => void;
  getRotation: (id: string) => Euler;
  setScale: (id: string, scale: Vector3) => void;
  getScale: (id: string) => Vector3;
  setMaterialData: (id: string, mtype: 'standard' | 'phong' | 'toon' | 'shader' | 'reflection', value: any) => void;
  getMaterialData: (id: string) => any;
  setArg: (id: string, key: string, arg: any) => void;
  onOMIdChanged: (id: string, listener: () => void) => void;
  offOMIdChanged: (id: string, listener: () => void) => void;
  onOMsChanged: (listener: () => void) => void;
  offOMsChanged: (listener: () => void) => void;
  onSMsChanged: (listener: () => void) => void;
  offSMsChanged: (listener: () => void) => void;
  setNJCFile: (njcFile: NJCFile) => void;
  onNJCChanged: (listener: () => void) => void;
  offNJCChanged: (listener: () => void) => void;
  addOM: (om: IObjectManagement) => void;
  removeOM: (id: string) => void;
  addSM: (sm: IScriptManagement) => boolean;
  getOMById: (id: string | null) => IObjectManagement | undefined;
  getSMById: (id: string) => IScriptManagement | undefined;
  getAvatarOM: () => IObjectManagement | undefined;
  getLights: () => IObjectManagement[];
};
const NinjaEditorContext = createContext<NinjaEditorProp>({
  oms: [],
  ums: [],
  tms: [],
  sms: [],
  transformDecimal: 2,
  mode: ECBMode.POSITION,
  gltfViewerObj: null,
  wireFrameColor: '#ffffff',
  fileSelect: '',
  assetRoute: '',
  contentsSelect: false,
  contentsSelectType: null,
  contentsSelectPath: null,
  ready: false,
  initialize: () => {},
  setCamera: () => {},
  setPlayerManager: () => {},
  setSelectPlayerAnimation: () => {},
  undo: () => {},
  redo: () => {},
  setName: () => {},
  setVisibleType: () => {},
  setVisible: () => {},
  setPosition: () => {},
  getPosition: () => new Vector3(0, 0, 0),
  setRotation: () => {},
  getRotation: () => new Euler(0, 0, 0),
  setScale: () => {},
  getScale: () => new Vector3(1, 1, 1),
  setMaterialData: () => {},
  getMaterialData: () => {},
  setArg: () => {},
  onOMIdChanged: () => {},
  offOMIdChanged: () => {},
  onOMsChanged: () => {},
  offOMsChanged: () => {},
  onSMsChanged: () => {},
  offSMsChanged: () => {},
  setNJCFile: () => {},
  onNJCChanged: () => {},
  offNJCChanged: () => {},
  addOM: () => {},
  removeOM: () => {},
  addSM: () => false,
  getOMById: () => undefined,
  getSMById: () => undefined,
  getAvatarOM: () => undefined,
  getLights: () => [],
});

export const useNinjaEditor = () => useContext(NinjaEditorContext);

interface IHistory {
  type: 'add' | 'remove' | 'update';
  objectType: 'object' | 'ui'; // 今のところobjectのみ
  om?: IObjectManagement;
  um?: IUIManagement;
}
const HISTORY_MAX = 30; // 履歴の最大数

export const NinjaEditorProvider = ({ children }) => {
  const [ready, setReady] = useState<boolean>(false); // 初期化完了フラグ
  // コンテンツ管理
  const [oms, setOMs] = useState<IObjectManagement[]>([]);
  const [ums, setUMs] = useState<IUIManagement[]>([]);
  const [tms, setTMs] = useState<ITextureManagement[]>([]);
  const [sms, setSMs] = useState<IScriptManagement[]>([]);
  const orbit = useRef<OrbitControlsImpl | null>(null);
  const transformDecimal = 2;
  // コンテンツブラウザで利用
  const mode = useRef<ECBMode>(ECBMode.POSITION);
  const gltfViewerObj = useRef<Object3D | null>(null);
  const wireFrameColor = useRef<string>('#ffffff');
  const fileSelect = useRef<string>('');
  const assetRoute = useRef<string>('');
  const contentsSelect = useRef<boolean>(false);
  const contentsSelectType = useRef<ECBSelectType | null>(null);
  const contentsSelectPath = useRef<string | null>(null);
  // 操作履歴
  const history = useRef<{ undo: IHistory[]; redo: IHistory[] }>({ undo: [], redo: [] });
  // プレイヤーパラメータ
  const playerManager = useRef<IPlayerManager>({
    type: 'avatar',
    selectAnim: 'idle',
    height: 1.7,
    animations: [],
    object: new Group(),
    animMapper: {},
    sounds: [],
    args: {},
  });

  /**
   * 初期化関数
   */
  const initialize = () => {
    // OM, UM, TM, SMを初期化
    setOMs([]);
    setUMs([]);
    setTMs([]);
    setSMs([]);
    if (orbit.current) {
      orbit.current.reset();
    }
    mode.current = ECBMode.POSITION;
    if (gltfViewerObj.current) {
      gltfViewerObj.current.remove(...gltfViewerObj.current.children);
      gltfViewerObj.current = null;
    }
    wireFrameColor.current = '#ffffff';
    fileSelect.current = '';
    assetRoute.current = '';
    contentsSelect.current = false;
    contentsSelectType.current = null;
    contentsSelectPath.current = null;
    playerManager.current = {
      type: 'avatar',
      selectAnim: 'idle',
      height: 1.7,
      animations: [],
      object: new Group(),
      animMapper: {},
      sounds: [],
      args: {},
    };
  };

  console.log('oms length reload: ', oms.length);

  /**
   * 元に戻す
   */
  const undo = () => {
    if (history.current.undo.length === 0) {
      return;
    }
    const last = history.current.undo.pop();
    if (!last) {
      return;
    }
    if (last.objectType === 'object' && last.om !== undefined) {
      if (last.type === 'add') {
        // OMにidがあれば削除
        if (oms.find((om) => om.id === last.om!.id)) {
          setOMs(oms.filter((om) => om.id !== last.om!.id));
          // historyに追加
          addHistory('redo', {
            type: 'remove',
            objectType: 'object',
            om: last.om,
          });
        }
      }
      if (last.type === 'remove') {
        // すでに同じIDがなければOMを追加
        if (!oms.find((om) => om.id === last.om!.id)) {
          setOMs([...oms, last.om]);
          // historyに追加
          addHistory('redo', {
            type: 'add',
            objectType: 'object',
            om: last.om,
          });
        }
      }
      if (last.type === 'update') {
        // OMを更新
        const target = oms.find((om) => om.id === last.om!.id);
        if (!target) {
          return;
        }
        target.args = last.om.args;
        // historyに追加
        addHistory('redo', {
          type: 'update',
          objectType: 'object',
          om: target,
        });
      }
    }
  };

  /**
   * やり直し
   */
  const redo = () => {
    if (history.current.redo.length === 0) {
      return;
    }
    const last = history.current.redo.pop();
    if (!last) {
      return;
    }
    if (last.objectType === 'object' && last.om !== undefined) {
      if (last.type === 'add') {
        // すでに同じIDがなければOMを追加
        if (!oms.find((om) => om.id === last.om!.id)) {
          setOMs([...oms, last.om]);
          // historyに追加
          addHistory('undo', {
            type: 'add',
            objectType: 'object',
            om: last.om,
          });
        }
      }
      if (last.type === 'remove') {
        // OMにIDがあれば削除
        if (oms.find((om) => om.id === last.om!.id)) {
          setOMs(oms.filter((om) => om.id !== last.om!.id));
          // historyに追加
          addHistory('undo', {
            type: 'remove',
            objectType: 'object',
            om: last.om,
          });
        }
      }
      if (last.type === 'update') {
        // OMを更新
        const target = oms.find((om) => om.id === last.om!.id);
        if (!target) {
          return;
        }
        target.args = last.om.args;
        // historyに追加
        addHistory('undo', {
          type: 'update',
          objectType: 'object',
          om: target,
        });
      }
    }
  };

  /**
   * undo/redo用の履歴を追加
   */
  const addHistory = (type: 'undo' | 'redo', newHistory: IHistory) => {
    if (type === 'undo') {
      history.current.undo.push(newHistory);
      if (history.current.undo.length > HISTORY_MAX) {
        history.current.undo.shift();
      }
    }
    if (type === 'redo') {
      history.current.redo.push(newHistory);
      if (history.current.redo.length > HISTORY_MAX) {
        history.current.redo.shift();
      }
    }
  };

  const setCamera = (camera: OrbitControlsImpl) => {
    orbit.current = camera;
  };

  const setPlayerManager = (pm: IPlayerManager) => {
    playerManager.current = pm;
  };

  const setSelectPlayerAnimation = (anim: string) => {
    playerManager.current.selectAnim = anim;
  };

  /**
   * 特定のObjectの名前を変更
   */
  const setName = (id: string, name: string) => {
    const target = oms.find((om) => om.id === id);
    if (target) {
      target.name = name;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };

  /**
   * 特定のObjectのVisibleTypeを変更
   */
  const setVisibleType = (id: string, visibleType: 'force' | 'auto') => {
    const target = oms.find((om) => om.id === id);
    if (target) {
      target.visibleType = visibleType;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };
  const setVisible = (id: string, visible: boolean) => {
    const target = oms.find((om) => om.id === id);
    if (target) {
      target.visible = visible;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };

  /**
   * 特定のObjectのPositionを変更
   * @param id
   * @param position
   */
  const setPosition = (id: string, position: Vector3) => {
    const target = oms.find((om) => om.id === id);
    if (target) {
      target.args.position = position;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };
  const getPosition = (id: string): Vector3 => {
    const target = oms.find((om) => om.id == id);
    if (!target || !target.args.position) {
      return new Vector3(0, 0, 0);
    }
    return target.args.position;
  };

  /**
   * 特定のObjectのRotationを変更
   * @param id
   * @param rotation
   */
  const setRotation = (id: string, rotation: Euler) => {
    const target = oms.find((om) => om.id === id);
    if (target) {
      target.args.rotation = rotation;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };
  const getRotation = (id: string): Euler => {
    const target = oms.find((om) => om.id == id);
    if (!target || !target.args.rotation) {
      return new Euler(0, 0, 0);
    }
    return target.args.rotation;
  };

  /**
   * 特定のObjectのScaleを変更
   * @param id
   * @param scale
   */
  const setScale = (id: string, scale: Vector3) => {
    const target = oms.find((om) => om.id === id);
    if (target) {
      target.args.scale = scale;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };
  const getScale = (id: string): Vector3 => {
    const target = oms.find((om) => om.id == id);
    if (!target || !target.args.scale) {
      return new Vector3(1, 1, 1);
    }
    return target.args.scale;
  };

  /**
   * マテリアルの変更
   * @param id
   * @param material Material
   */
  const setMaterialData = (id: string, mtype: 'standard' | 'phong' | 'toon' | 'shader' | 'reflection', value: any) => {
    const target = oms.find((om) => om.id == id);
    if (target) {
      target.args.materialData = {
        type: mtype,
        value: value,
      };
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };
  const getMaterialData = (id: string): any => {
    const target = oms.find((om) => om.id == id);
    if (!target || !target.args.materialData) {
      return undefined;
    }
    return target.args.materialData;
  };

  /**
   * argの変更
   * /CastShadow/Helper/Color/
   */
  const setArg = (id: string, key: string, arg: any) => {
    const target = oms.find((om) => om.id == id);
    if (target) {
      target.args[key] = arg;
      notifyOMIdChanged(id);
      // historyに追加
      addHistory('undo', {
        type: 'update',
        objectType: 'object',
        om: target,
      });
    }
  };

  /** -------- Control Select Object ------- */
  const addOM = (om: IObjectManagement) => {
    // historyに追加
    addHistory('undo', {
      type: 'add',
      objectType: 'object',
      om: om,
    });
    setOMs([...oms, om]);
  };
  const updateOM = (om: IObjectManagement) => {
    // historyに追加
    addHistory('undo', {
      type: 'update',
      objectType: 'object',
      om: om,
    });
  };
  const removeOM = (id: string) => {
    // historyに追加
    addHistory('undo', {
      type: 'remove',
      objectType: 'object',
      om: oms.find((om) => om.id === id),
    });
    const newOms = oms.filter((om) => om.id !== id);
    setOMs([...newOms]);
  };
  const getOMById = (id: string): IObjectManagement | undefined => {
    return oms.find((om) => om.id === id);
  };
  const getSMById = (id: string): IScriptManagement | undefined => {
    return sms.find((sm) => sm.id === id);
  };
  const getAvatarOM = () => {
    return oms.find((om) => om.type === 'avatar');
  };
  const getLights = () => {
    return oms.filter((om) => om.type === 'light');
  };
  const addSM = (sm: IScriptManagement): boolean => {
    // historyに追加
    // addHistory("undo", {
    //   type: "add",
    //   objectType: "script",
    //   um: sm,
    // });
    // 同名のSMがある場合は追加しない
    const target = sms.find((_sm) => _sm.name === sm.name);
    if (target) {
      return false;
    }
    setSMs([...sms, sm]);
    return true;
  };

  /**---------  Listener  ---------- */
  /**
   * 個別のOM変更リスナー
   */
  const objectManagementIdChangedListeners = useRef<{ [id: string]: (() => void)[] }>({});
  const onOMIdChanged = (id: string, listener: () => void) => {
    if (!objectManagementIdChangedListeners.current[id]) {
      objectManagementIdChangedListeners.current[id] = [];
    }
    objectManagementIdChangedListeners.current[id].push(listener);
  };
  const offOMIdChanged = (id: string, listener: () => void) => {
    if (!objectManagementIdChangedListeners.current[id]) {
      return;
    }
    objectManagementIdChangedListeners.current[id] = objectManagementIdChangedListeners.current[id].filter(
      (l) => l !== listener,
    );
  };
  // 特定のOM変更を通知する
  const notifyOMIdChanged = (id: string) => {
    if (!objectManagementIdChangedListeners.current[id]) {
      return;
    }
    objectManagementIdChangedListeners.current[id].forEach((l) => l());
  };
  /**
   * OMの変更リスナー
   */
  const objectManagementChangedListeners = useRef<(() => void)[]>([]);
  const onOMsChanged = (listener: () => void) => {
    objectManagementChangedListeners.current.push(listener);
  };
  const offOMsChanged = (listener: () => void) => {
    objectManagementChangedListeners.current = objectManagementChangedListeners.current.filter((l) => l !== listener);
  };
  // OMの変更を通知する
  const notifyOMsChanged = () => {
    objectManagementChangedListeners.current.forEach((l) => l());
  };
  /**
   * SMの変更リスナー
   */
  const scriptManagementChangedListeners = useRef<(() => void)[]>([]);
  const onSMsChanged = (listener: () => void) => {
    scriptManagementChangedListeners.current.push(listener);
  };
  const offSMsChanged = (listener: () => void) => {
    scriptManagementChangedListeners.current = scriptManagementChangedListeners.current.filter((l) => l !== listener);
  };
  // SMの変更を通知する
  const notifySMsChanged = () => {
    scriptManagementChangedListeners.current.forEach((l) => l());
  };

  /**
   * NJCの変更リスナー
   */
  /**
   * NJCファイルのロード
   * @param njcFile
   */
  const setNJCFile = (njcFile: NJCFile) => {
    initialize();
    setOMs(njcFile.oms);
    setUMs(njcFile.ums);
    setTMs(njcFile.tms);
    setSMs(njcFile.sms);
    console.log('<< Complete NJC File >>');
    notifyNJCChanged();
    notifyOMsChanged();
    notifySMsChanged();
  };
  const njcChangedListeners = useRef<(() => void)[]>([]);
  const onNJCChanged = (listener: () => void) => {
    njcChangedListeners.current.push(listener);
  };
  const offNJCChanged = (listener: () => void) => {
    njcChangedListeners.current = njcChangedListeners.current.filter((l) => l !== listener);
  };
  // NJCの変更を通知する
  const notifyNJCChanged = () => {
    njcChangedListeners.current.forEach((l) => l());
  };

  const undoEvent = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'z') {
      undo();
    } else if (e.ctrlKey && e.key === 'y') {
      redo();
    }
  };

  // 初期設定
  useEffect(() => {
    initialize();
    const initOms = initThirdPersonTemplate();
    setOMs(initOms);
    setReady(true);
  }, []);

  // Undo/Redoの履歴を初期化
  useEffect(() => {
    // Ctrl + Zでundo
    document.addEventListener('keydown', undoEvent);
    return () => {
      document.removeEventListener('keydown', undoEvent);
    };
  }, [oms, sms, ums, tms]);

  return (
    <NinjaEditorContext.Provider
      value={{
        oms,
        ums,
        tms,
        sms,
        transformDecimal,
        mode: mode.current,
        gltfViewerObj: gltfViewerObj.current,
        wireFrameColor: wireFrameColor.current,
        fileSelect: fileSelect.current,
        assetRoute: assetRoute.current,
        contentsSelect: contentsSelect.current,
        contentsSelectType: contentsSelectType.current,
        contentsSelectPath: contentsSelectPath.current,
        ready,
        initialize,
        setCamera,
        setPlayerManager,
        setSelectPlayerAnimation,
        undo,
        redo,
        setName,
        setVisibleType,
        setVisible,
        setPosition,
        getPosition,
        setRotation,
        getRotation,
        setScale,
        getScale,
        setMaterialData,
        getMaterialData,
        setArg,
        onOMIdChanged,
        offOMIdChanged,
        onOMsChanged,
        offOMsChanged,
        onSMsChanged,
        offSMsChanged,
        setNJCFile,
        onNJCChanged,
        offNJCChanged,
        addOM,
        removeOM,
        addSM,
        getOMById,
        getSMById,
        getAvatarOM,
        getLights,
      }}
    >
      {ready && <>{children}</>}
    </NinjaEditorContext.Provider>
  );
};
