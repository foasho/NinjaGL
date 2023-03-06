import { Euler, Object3D, Vector3 } from "three";
import { createContext } from "react";
import { IObjectManagement } from "@/engine/core/NaniwaProps";

export class NaniwaEditorManager {
    oms: IObjectManagement[] = [];
    selectedIds: string[] = [];
    gltfViewerObj: Object3D;

    constructor(){}

    setPosition(id: string, position: Vector3){
        const target = this.oms.find(om => om.id == id);
        target.args.position = new Vector3().copy(position);
    }

    setRotation(id: string, rotation: Euler){
        const target = this.oms.find(om => om.id == id);
        target.args.rotation = new Euler().copy(rotation);
    }

    setObjectManagement = (object: Object3D) => {
        this.oms.push(
            {
                id: object.uuid,
                object: object,
                visiableType: "auto",
                type: "object",
                args: {
                    position: null,
                    rotation: null
                }
            }
        );
    }

    getOMs(){

    }

}

export const NaniwaEditorContext = createContext<NaniwaEditorManager>(null);