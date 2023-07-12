import { IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from "@ninjagl/core";
import { createContext, useContext, useRef, useState } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Group, Object3D } from "three";

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

/**
 * プレイヤー
 */
export interface IPlayerManager {
  type: "avatar";
  selectAnim: string;
  height: number;
  animations: [],
  object: Group;
  animMapper: {[key: string]: string};
  sounds: any[];
  args: any;
}

type NinjaEditorProp = {
};
const NinjaEditorContext = createContext<NinjaEditorProp>({});

export const useNinjaEditor = () => useContext(NinjaEditorContext);

export const NinjaEditorProvider = ({ children }) => {
  // コンテンツ管理
  const [oms, setOMs] = useState<IObjectManagement[]>([]);
  const [ums, setUMs] = useState<IUIManagement[]>([]);
  const [tms, setTMs] = useState<ITextureManagement[]>([]);
  const [sms, setSMs] = useState<IScriptManagement[]>([]);
  const orbit = useRef<OrbitControlsImpl|null>(null);
  const transformDecimal = 2;
  // コンテンツブラウザで利用
  const mode = useRef<ECBMode>(ECBMode.POSITION);
  const gltfViewerObj = useRef<Object3D|null>(null);
  const wireFrameColor = useRef<string>("#ffffff");
  const fileSelect = useRef<string>("");
  const assetRoute = useRef<string>("");
  const contentsSelect = useRef<boolean>(false);
  const contentsSelectType = useRef<ECBSelectType|null>(null);
  const contentsSelectPath = useRef<string|null>(null);
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

  /**
   * 初期化関数
   */
  const initialize = () => {
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
  }

  const setCamera = (camera: OrbitControlsImpl) => {
    orbit.current = camera;
  }

  const setPlayerManager = (pm: IPlayerManager) => {
    playerManager.current = pm;
  }

  const setSelectPlayerAnimation = (anim: string) => {
    playerManager.current.selectAnim = anim;
  }

  

  return (
    <NinjaEditorContext.Provider value={{

    }}>
      {children}
    </NinjaEditorContext.Provider>
  )
}