import { Euler, Object3D, Vector3 } from "three";
import { createContext } from "react";

export class NaniwaEditorManager {
    objects: Object3D[] = [];
    selectObject: Object3D = null;
    selectObjectType: string = "object";
    selectParameter: { [key: string]: any } = {};
    position: Vector3 = new Vector3(0, 0, 0);
    rotation: Euler = new Euler(0, 0, 0);
    
    constructor(){}
}

export const NaniwaEditorContext = createContext<NaniwaEditorManager>(null);