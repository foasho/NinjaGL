import { Object3D, Mesh, Group, Vector2, AnimationClip, AnimationMixer } from "three";

export interface INaniwaProps {
    mode: "play" | "edit"
}

export interface IInputMovement {
    forward   : boolean;
    backward  : boolean;
    left      : boolean;
    right     : boolean;
    jump      : boolean;
    dash      : boolean;
    action    : boolean;
    prevDrag? : Vector2; // カメラ向きに利用（あとで実装）
    currDrag? : Vector2; // カメラ向きに利用（あとで実装）
}

export interface IObjectManagement {
    type          : "three" | "object" | "avatar" | "terrain" | "others";
    args          : any;
    rules?        : any;
    object?       : Object3D;
    animations?   : AnimationClip[];
    mixer?        : AnimationMixer;
}