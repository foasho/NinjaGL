import { Object3D, Mesh, Group, Vector2, AnimationClip, AnimationMixer, Audio } from "three";

export interface INaniwaProps {
  mode: "play" | "edit"
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
  prevDrag?: Vector2; // カメラ向きに利用（あとで実装）
  currDrag?: Vector2; // カメラ向きに利用（あとで実装）
  deviceType: "mobile" | "tablet" | "desktop";
}

/**
 * Canvas上に表示されるもの
 */
export interface IObjectManagement {
  id: string;
  name?: string;
  type: "three" | "object" | "avatar" | "terrain" | "others" | "sky" | "light";
  filePath?: string;
  visiableType: "auto" | "force" | "none";
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
}

export interface ISoundProps {
  key: string;
  sound: Audio;
  loop: boolean;
  volume: number;
  filePath: string;
  trigAnim?: string;
  stopAnim?: string;
}

export interface ISetSoundOption {
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