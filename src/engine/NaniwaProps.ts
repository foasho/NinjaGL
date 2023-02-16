import { Object3D, Mesh, Group, Vector2 } from "three";

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
    prevDrag? : Vector2; // カメラ向きに利用（あとで実装）
    currDrag? : Vector2; // カメラ向きに利用（あとで実装）
}

export interface IObjectManagement {
    type          : "three" | "object" | "avatar" | "terrain" | "others";
    filePath?     : string;
    args          : any;
    fileSize?     : number;
    rules?        : any;
    object?       : Object3D;
}