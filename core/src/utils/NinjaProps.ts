import { Object3D, Mesh, Group, Vector2, AnimationClip, AnimationMixer, Audio, Vector3 } from "three";

/**
 * NinjaGLの基本パラメータ
 */
export interface IConfigParams {
  physics: boolean; // 物理演算を有効にするか
  autoScale: boolean; // 自動スケールさせるか
  alpha: boolean; // 透過を有効にするか
  logarithmicDepthBuffer: boolean; // ログデプスバッファを有効にするか
  antialias: boolean; // アンチエイリアスを有効にするか
  shadowResolution: 128 | 256 | 512 | 1024; // 影の解像度レベル(128 | 256 | 512 | 1024)
  mapsize: number; // マップサイズ
  layerGridNum: number; // レイヤーグリッド数
  lodDistance: number; // LODの切り替えStep距離
  dpr: undefined | number | [number, number]; // デバイスピクセル比※undefinedの場合は(window.devicePixelRatio || 1)を利用
  initCameraPosition?: Vector3; // カメラの初期位置
  isDebug?: boolean; // デバッグモード
}

/**
 * 入力系のInputパラメータ
 */
export interface IInputMovement {
  forward: number;
  backward: number;
  left: number;
  right: number;
  jump: boolean;
  dash: boolean;
  action: boolean;
  speed: number;
  prevDrag: Vector2 | null;
  curDrag: Vector2 | null;
  pressedKeys: string[];
  angleAxis: [number, number];
}

/**
 * Canvas上に表示されるもの
 */
export interface IObjectManagement {
  id: string;
  name?: string;
  type: "three" | "object" | "lodobject" | "avatar" | "terrain" | "others" | "text" | "text3d"
    | "sky" | "light" | "fog" | "camera" | "effect" | "cloud" | "environment" | "lightformer";
  filePath?: string;
  visibleType: "auto" | "force";
  visible: boolean;
  layerNum?: number;
  args: any;
  rules?: any;
  object?: Object3D;
  physics: boolean;
  phyType: "box"| "sphere" | "capsule" | "along";
  animations?: AnimationClip[];
  mixer?: AnimationMixer;
}

/**
 * 操作系UI上に表示されるもの
 */
export interface IUIManagement {
  type: "controller" | "radio" | "icon" | "vrbtn" | "walletbtn" | "rtc";
  id: string;
  name?: string;
  position: {
    x: number;
    y: number;
  }
  styles?: string;
  args?: any;
  visible: boolean;
}

/**
 * テクスチャマネジメント
 */
export interface ITextureManagement {
  type: "image";
  id: string;
  name?: string;
  filePath?: string;
}

/**
 * Shaderマネジメント
 */
export interface IShaderManagement {
  id: string;
  vertexShader?: string;
  fragmentShader?: string;
  name?: string;
  filePath?: string;
  binary: Blob;
}


/**
 * スクリプトマネジメント
 */
export interface IScriptManagement {
  type: string;     // 種別: "script"今は一つだけ
  id: string;       // ID: UUID
  name: string;     // 名前
  script: string;  // JSスクリプトデータ
}

export interface ISoundProps {
  id: string;
  key: string;
  sound: Audio;
  loop: boolean;
  volume: number;
  filePath: string;
  position?: Vector3;
  trigAnim?: string;
  stopAnim?: string;
}

export interface ISetSoundOption {
  id: string;
  key: string;
  filePath: string;
  loop: boolean;
  volume: number;
  trigAnim?: string;
  stopAnim?: string;
}

export interface IUpdateSoundOption {
  key: string;
  filePath?: string;
  loop?: boolean;
  volume?: number;
  trigAnim?: string;
  stopAnim?: string;
}