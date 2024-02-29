"use client";
import type {
  IConfigParams,
  IObjectManagement,
  IScriptManagement,
  ITextureManagement,
  IUIManagement,
  NJCFile,
  OMPhysicsType,
} from "@ninjagl/core";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { debounce, throttle } from "lodash-es";
import { Euler, Group, MathUtils, Object3D, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { MySwal } from "@/commons/Swal";
import { setInitConfig } from "@/editor/Store/Store";
import { useRedoUndo } from "@/services/redoundo";
import { DeepCopyOM, OMArgs2Class } from "@/utils/convs";
import { deleteServerOM, sendServerOM, updateProjectData } from "@/utils/dataSync";
import { initTpOms, initTpSms, initTpUis } from "@/utils/initTpProjects";

/**
 * コンテンツブラウザの操作モード
 */
export enum ECBMode {
  POSITION = "position",
  ROTATION = "rotation",
  SCALE = "scale",
}

/**
 * コンテンツブラウザのファイル種別
 */
export enum ECBSelectType {
  GLTF = "gltf",
  MP3 = "mp3",
  JS = "js",
  GLSL = "glsl",
  IMAGE = "image",
  TER = "ter",
  AVT = "avt",
  CAMERA = "camera",
}

export type TemplateProps = "third_person_metaverse";

/**
 * プレイヤー
 */
export interface IPlayerManager {
  type: "avatar";
  selectAnim: string;
  height: number;
  animations: [];
  object: Group;
  animMapper: { [key: string]: string };
  sounds: any[];
  args: any;
}

type NinjaEditorProp = {
  projectId?: number;
  oms: React.MutableRefObject<IObjectManagement[]>;
  ums: React.MutableRefObject<IUIManagement[]>;
  tms: React.MutableRefObject<ITextureManagement[]>;
  sms: React.MutableRefObject<IScriptManagement[]>;
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
  setName: (id: string, name: string) => void;
  setVisibleType: (id: string, visibleType: "force" | "auto") => void;
  setVisible: (id: string, visible: boolean) => void;
  setPosition: (id: string, position: Vector3) => void;
  getPosition: (id: string) => Vector3;
  setRotation: (id: string, rotation: Euler) => void;
  getRotation: (id: string) => Euler;
  setScale: (id: string, scale: Vector3) => void;
  getScale: (id: string) => Vector3;
  setMaterialData: (id: string, mtype: "standard" | "phong" | "toon" | "shader" | "reflection", value: any) => void;
  getMaterialData: (id: string) => any;
  setArg: (id: string, key: string, arg: any, notify?: boolean, updated?: boolean) => void;
  setPhysics: (id: string, physics: boolean) => void;
  setPhyType: (id: string, phyType: OMPhysicsType) => void;
  setMoveable: (id: string, moveable: boolean) => void;
  onOMIdChanged: (id: string, listener: () => void) => void;
  offOMIdChanged: (id: string, listener: () => void) => void;
  notifyOMIdChanged: (id: string) => void;
  onOMsChanged: (listener: () => void) => void;
  offOMsChanged: (listener: () => void) => void;
  onSMsChanged: (listener: () => void) => void;
  offSMsChanged: (listener: () => void) => void;
  setNJCFile: (njcFile: NJCFile) => void;
  onNJCChanged: (listener: () => void) => void;
  offNJCChanged: (listener: () => void) => void;
  addOM: (om: IObjectManagement) => void;
  removeOM: (id: string) => void;
  copyOM: (om: IObjectManagement) => void;
  getCopyOM: () => IObjectManagement | null;
  addSM: (sm: IScriptManagement) => boolean;
  getOMById: (id: string | null) => IObjectManagement | undefined;
  getSMById: (id: string) => IScriptManagement | undefined;
  getAvatarOM: () => IObjectManagement | undefined;
  getLights: () => IObjectManagement[];
  selectTemplate: (template: TemplateProps) => void;
};
const NinjaEditorContext = createContext<NinjaEditorProp>({
  projectId: undefined,
  oms: { current: [] },
  ums: { current: [] },
  tms: { current: [] },
  sms: { current: [] },
  transformDecimal: 2,
  mode: ECBMode.POSITION,
  gltfViewerObj: null,
  wireFrameColor: "#ffffff",
  fileSelect: "",
  assetRoute: "",
  contentsSelect: false,
  contentsSelectType: null,
  contentsSelectPath: null,
  ready: false,
  initialize: () => {},
  setCamera: () => {},
  setPlayerManager: () => {},
  setSelectPlayerAnimation: () => {},
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
  setPhysics: () => {},
  setPhyType: () => {},
  setMoveable: () => {},
  onOMIdChanged: () => {},
  offOMIdChanged: () => {},
  notifyOMIdChanged: () => {},
  onOMsChanged: () => {},
  offOMsChanged: () => {},
  onSMsChanged: () => {},
  offSMsChanged: () => {},
  setNJCFile: () => {},
  onNJCChanged: () => {},
  offNJCChanged: () => {},
  addOM: () => {},
  removeOM: () => {},
  copyOM: () => {},
  getCopyOM: () => null,
  addSM: () => false,
  getOMById: () => undefined,
  getSMById: () => undefined,
  getAvatarOM: () => undefined,
  getLights: () => [],
  selectTemplate: (template: TemplateProps) => {},
});

export const useNinjaEditor = () => useContext(NinjaEditorContext);

type NinjaEditorProviderProps = {
  children: React.ReactNode;
  projectId?: number;
  initOMs?: IObjectManagement[];
  initSMs?: IScriptManagement[];
  initConfig?: IConfigParams;
};
export const NinjaEditorProvider = ({
  children,
  projectId,
  initOMs = [],
  initSMs = [],
  initConfig,
}: NinjaEditorProviderProps) => {
  const [ready, setReady] = useState<boolean>(false); // 初期化完了フラグ
  // コンテンツ管理
  const oms = useRef<IObjectManagement[]>([]);
  const ums = useRef<IUIManagement[]>([]);
  const tms = useRef<ITextureManagement[]>([]);
  const sms = useRef<IScriptManagement[]>([]);
  const orbit = useRef<OrbitControlsImpl | null>(null);
  const transformDecimal = 2;
  // コンテンツブラウザで利用
  const mode = useRef<ECBMode>(ECBMode.POSITION);
  const gltfViewerObj = useRef<Object3D | null>(null);
  const wireFrameColor = useRef<string>("#ffffff");
  const fileSelect = useRef<string>("");
  const assetRoute = useRef<string>("");
  const contentsSelect = useRef<boolean>(false);
  const contentsSelectType = useRef<ECBSelectType | null>(null);
  const contentsSelectPath = useRef<string | null>(null);
  // プレイヤーパラメータ
  const playerManager = useRef<IPlayerManager>({
    type: "avatar",
    selectAnim: "idle",
    height: 1.7,
    animations: [],
    object: new Group(),
    animMapper: {},
    sounds: [],
    args: {},
  });
  // Copy/Paste用
  const copyOMRef = useRef<IObjectManagement | null>(null);

  /**
   * 初期化関数
   */
  const initialize = () => {
    // OM, UM, TM, SMを初期化
    const _oms = initOMs.map(OMArgs2Class);
    oms.current = _oms;
    ums.current = [];
    tms.current = [];
    sms.current = initSMs;
    if (initConfig) {
      setInitConfig(initConfig);
    }
    if (orbit.current) {
      orbit.current.reset();
    }
    mode.current = ECBMode.POSITION;
    if (gltfViewerObj.current) {
      gltfViewerObj.current.remove(...gltfViewerObj.current.children);
      gltfViewerObj.current = null;
    }
    wireFrameColor.current = "#ffffff";
    fileSelect.current = "";
    assetRoute.current = "";
    contentsSelect.current = false;
    contentsSelectType.current = null;
    contentsSelectPath.current = null;
    playerManager.current = {
      type: "avatar",
      selectAnim: "idle",
      height: 1.7,
      animations: [],
      object: new Group(),
      animMapper: {},
      sounds: [],
      args: {},
    };
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
    const target = oms.current.find((om) => om.id === id);
    if (target) {
      target.name = name;
      notifyOMIdChanged(id);
      updateOM(target, "name");
    }
  };

  /**
   * 特定のObjectのVisibleTypeを変更
   */
  const setVisibleType = (id: string, visibleType: "force" | "auto") => {
    const target = oms.current.find((om) => om.id === id);
    if (target) {
      target.visibleType = visibleType;
      notifyOMIdChanged(id);
      updateOM(target, "visibleType");
    }
  };
  const setVisible = (id: string, visible: boolean) => {
    const target = oms.current.find((om) => om.id === id);
    if (target) {
      target.visible = visible;
      notifyOMIdChanged(id);
      updateOM(target, "visible");
    }
  };

  /**
   * 特定のObjectのPositionを変更
   * @param id
   * @param position
   */
  const _setPosition = (id: string, position: Vector3) => {
    const target = oms.current.find((om) => om.id === id);
    if (target && target.args.position !== position) {
      target.args.position = position;
      notifyOMIdChanged(id);
      updateOM(target, "position");
    }
  };
  const getPosition = (id: string): Vector3 => {
    const target = oms.current.find((om) => om.id == id);
    if (!target || !target.args.position) {
      return new Vector3(0, 0, 0);
    }
    return target.args.position;
  };
  const setPosition = throttle(_setPosition, 100);

  /**
   * 特定のObjectのRotationを変更
   * @param id
   * @param rotation
   */
  const _setRotation = (id: string, rotation: Euler) => {
    const target = oms.current.find((om) => om.id === id);
    if (target && target.args.rotation !== rotation) {
      target.args.rotation = rotation;
      notifyOMIdChanged(id);
      updateOM(target, "rotation");
    }
  };
  const getRotation = (id: string): Euler => {
    const target = oms.current.find((om) => om.id == id);
    if (!target || !target.args.rotation) {
      return new Euler(0, 0, 0);
    }
    return target.args.rotation;
  };
  const setRotation = throttle(_setRotation, 100);

  /**
   * 特定のObjectのScaleを変更
   * @param id
   * @param scale
   */
  const _setScale = (id: string, scale: Vector3) => {
    const target = oms.current.find((om) => om.id === id);
    if (target && target.args.scale !== scale) {
      target.args.scale = scale;
      notifyOMIdChanged(id);
      updateOM(target, "scale");
    }
  };
  const getScale = (id: string): Vector3 => {
    const target = oms.current.find((om) => om.id == id);
    if (!target || !target.args.scale) {
      return new Vector3(1, 1, 1);
    }
    return target.args.scale;
  };
  const setScale = throttle(_setScale, 100);

  /**
   * マテリアルの変更
   * @param id
   * @param material Material
   */
  const _setMaterialData = (id: string, mtype: "standard" | "phong" | "toon" | "shader" | "reflection", value: any) => {
    const target = oms.current.find((om) => om.id == id);
    if (target) {
      updateOM(target, "materialData");
      target.args.materialData = {
        type: mtype,
        value: value,
      };
      notifyOMIdChanged(id);
    }
  };
  const getMaterialData = (id: string): any => {
    const target = oms.current.find((om) => om.id == id);
    if (!target || !target.args.materialData) {
      return undefined;
    }
    return target.args.materialData;
  };
  const setMaterialData = debounce(_setMaterialData, 100);

  /**
   * argの変更
   * /CastShadow/Helper/Color/
   */
  const setArg = (id: string, key: string, arg: any, notify = true, updated = true) => {
    const target = oms.current.find((om) => om.id == id);
    if (target) {
      if (updated) updateOM({ ...target }, key);
      target.args[key] = arg;
      if (notify) notifyOMIdChanged(id);
    }
  };

  /**
   * physicsの設定
   */
  const setPhysics = (id: string, physics: boolean) => {
    const target = oms.current.find((om) => om.id == id);
    if (target) {
      target.physics = physics;
    }
  };

  /**
   * phyTypeの設定
   */
  const setPhyType = (id: string, phyType: OMPhysicsType) => {
    const target = oms.current.find((om) => om.id == id);
    if (target) {
      target.phyType = phyType;
    }
  };

  /**
   * moveable(physics)の設定
   */
  const setMoveable = (id: string, moveable: boolean) => {
    const target = oms.current.find((om) => om.id == id);
    if (target) {
      target.moveable = moveable;
    }
  };

  /** -------- Control Select Object ------- */
  const addOM = (om: IObjectManagement) => {
    // historyに追加
    addHistory("undo", {
      type: "add",
      objectType: "object",
      changedArg: "",
      om: om,
    });
    oms.current = [...oms.current, om];
    // 更新
    notifyOMsChanged();
    if (projectId) sendServerOM(projectId, om);
  };
  const updateOM = (om: IObjectManagement, changedArg: string) => {
    // historyに追加
    addHistory("undo", {
      type: "update",
      objectType: "object",
      changedArg: changedArg,
      om: DeepCopyOM(om),
    });
    if (projectId) sendServerOM(projectId, om);
  };
  const removeOM = (id: string) => {
    // historyに追加
    addHistory("undo", {
      type: "remove",
      objectType: "object",
      changedArg: "",
      om: oms.current.find((om) => om.id === id),
    });
    const newOms = oms.current.filter((om) => om.id !== id);
    oms.current = newOms;
    // 更新
    notifyOMsChanged();
    if (projectId) deleteServerOM(projectId, id);
  };
  const copyOM = (om: IObjectManagement) => {
    // typeがEnvironment/Sky/Player/Effect/LandScape以外のときのみ
    if (
      om.type === "environment" ||
      om.type === "sky" ||
      om.type === "avatar" ||
      om.type === "effect" ||
      om.type === "landscape"
    ) {
      MySwal.fire({
        title: "Copy",
        text: "Copy is not allowed object type",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    // Copyしたオブジェクトがわかりやすいように少し移動させる
    const newPosition = om.args.position ? om.args.position.clone() : new Vector3(0, 0, 0);
    newPosition.add(new Vector3(0.5, 0.5, 0.5));
    const newOMArgs = { ...om.args, position: newPosition };
    copyOMRef.current = { ...om, args: newOMArgs, id: MathUtils.generateUUID() };
  };
  const getOMById = (id: string): IObjectManagement | undefined => {
    return oms.current.find((om) => om.id === id);
  };
  const getSMById = (id: string): IScriptManagement | undefined => {
    return sms.current.find((sm) => sm.id === id);
  };
  const getAvatarOM = () => {
    return oms.current.find((om) => om.type === "avatar");
  };
  const getLights = () => {
    return oms.current.filter((om) => om.type === "light");
  };
  const addSM = (sm: IScriptManagement): boolean => {
    // historyに追加
    // addHistory("undo", {
    //   type: "add",
    //   objectType: "script",
    //   um: sm,
    // });
    // 同名のSMがある場合は追加しない
    const target = sms.current.find((_sm) => _sm.name === sm.name);
    if (target) {
      return false;
    }
    sms.current = [...sms.current, sm];
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
    oms.current = njcFile.oms;
    ums.current = njcFile.ums;
    tms.current = njcFile.tms;
    sms.current = njcFile.sms;
    console.info("<< Complete NJC File >>");
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

  // 初期設定
  useEffect(() => {
    initialize();
    setReady(true);
  }, []);

  const selectTemplate = (template: TemplateProps) => {
    switch (template) {
      case "third_person_metaverse":
        const initOms = initTpOms();
        const initSMs = initTpSms();
        const initUis = initTpUis();
        oms.current = initOms;
        sms.current = initSMs;
        ums.current = initUis;
        notifyOMsChanged();
        notifySMsChanged();
        break;
      default:
        break;
    }
    if (projectId) {
      updateProjectData(projectId, null, oms.current, sms.current);
    }
  };

  // 操作履歴
  const { addHistory } = useRedoUndo({ oms, notifyOMsChanged, notifyOMIdChanged });

  return (
    <NinjaEditorContext.Provider
      value={{
        projectId,
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
        setPhysics,
        setPhyType,
        setMoveable,
        onOMIdChanged,
        offOMIdChanged,
        notifyOMIdChanged,
        onOMsChanged,
        offOMsChanged,
        onSMsChanged,
        offSMsChanged,
        setNJCFile,
        onNJCChanged,
        offNJCChanged,
        addOM,
        removeOM,
        copyOM,
        getCopyOM: () => copyOMRef.current,
        addSM,
        getOMById,
        getSMById,
        getAvatarOM,
        getLights,
        selectTemplate,
      }}
    >
      {ready && <>{children}</>}
    </NinjaEditorContext.Provider>
  );
};
