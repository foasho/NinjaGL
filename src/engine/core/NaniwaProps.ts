import { Object3D, Mesh, Group, Vector2, AnimationClip, AnimationMixer, Audio } from "three";

export interface INaniwaProps {
    mode: "play" | "edit"
}

export interface IInputMovement {
    forward    : boolean;
    backward   : boolean;
    left       : boolean;
    right      : boolean;
    jump       : boolean;
    dash       : boolean;
    action     : boolean;
    prevDrag?  : Vector2; // カメラ向きに利用（あとで実装）
    currDrag?  : Vector2; // カメラ向きに利用（あとで実装）
    deviceType : "mobile" | "tablet" | "desktop";
}

export interface IObjectManagement {
    type          : "three" | "object" | "avatar" | "terrain" | "others" | "sky" | "light";
	visiableType  : "auto" | "force" | "none";
	layerNum?     : number;
    args          : any;
    rules?        : any;
    object?       : Object3D;
    animations?   : AnimationClip[];
    mixer?        : AnimationMixer;
}

export interface ISoundProps {
	key      : string;
	sound    : Audio;
	loop     : boolean;
	volume   : number;
	filePath : string;
	trigAnim?: string;
	stopAnim?: string;
}

export interface ISetSoundOption {
	key      : string;
	filePath : string; 
	loop     : boolean;
	volume   : number;
	trigAnim?: string;
	stopAnim?: string;
}

export interface IUpdateSoundOption {
	key       : string;
	filePath? : string; 
	loop?     : boolean;
	volume?   : number;
	trigAnim? : string;
	stopAnim? : string;
}