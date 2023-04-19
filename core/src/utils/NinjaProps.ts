import { Object3D, Mesh, Group, Vector2, AnimationClip, AnimationMixer, Audio, Vector3 } from "three";

/**
 * NinjaGLの基本パラメータ
 */
export interface IConfigParams {
  autoScale: boolean; // 自動スケールさせるか
  antialias: boolean; // アンチエイリアスを有効にするか
  shadowResolution: 128 | 256 | 512 | 1024; // 影の解像度レベル(128 | 256 | 512 | 1024)
  mapsize: number; // マップサイズ
  layerGridNum: number; // レイヤーグリッド数
  cameraFar: number; // カメラの遠近感
  lodDistance: number; // LODの切り替え距離
  dpr: number| number[]; // デバイスピクセル比
  viewGridLength: number; // ビューグリッドの長さ
  initCameraPosition?: Vector3; // カメラの初期位置
  octreeDepth: number; // オクトリーツリーの深さ
  isDebug?: boolean; // デバッグモード
}

/**
 * 入力系のInputパラメータ
 */
export interface IInputMovement {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  dash: boolean;
  action: boolean;
  prevDrag?: Vector2 | null; // カメラ向きに利用（あとで実装）
  currDrag?: Vector2 | null; // カメラ向きに利用（あとで実装）
  deviceType: "mobile" | "tablet" | "desktop";
  [key: string]: any;
}

/**
 * Canvas上に表示されるもの
 */
export interface IObjectManagement {
  id: string;
  name?: string;
  type: "three" | "object" | "lodobject" | "avatar" | "terrain" | "others" | "text"
    | "sky" | "light" | "fog" | "camera" | "effect" | "cloud" | "environment" | "lightformer";
  filePath?: string;
  visibleType: "auto" | "force" | "none";
  layerNum?: number;
  args: any;
  rules?: any;
  object?: Object3D;
  physics: "none" | "aabb" | "along" | "select";
  animations?: AnimationClip[];
  mixer?: AnimationMixer;
}

/**
 * 操作系UI上に表示されるもの
 */
export interface IUIManagement {
  type: "touchController" | "radioButton" | "icon";
  id: string;
  name?: string;
  styles?: string;
  args?: string;
  visibleType: "view" | "none";
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