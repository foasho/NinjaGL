import { Euler, Object3D, Vector3 } from "three";
import { createContext } from "react";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { TerrainMakerManager } from "../TerrainMaker/TerrainMakerManager";

export class NaniwaEditorManager {
    mode: "position"| "scale" = "position";
    oms: IObjectManagement[] = [];
    selectedIds: string[] = [];
    gltfViewerObj: Object3D;
    /**
     * コンテンツブラウザ
     */
    fileSelect: string = "";
    assetRoute: string = "";
    contentsSelect: boolean = false;
    contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" = null;
    contentsSelectPath: string = "";// コンテンツブラウザ内のItemを選択した時にパスを設定する
    /**
     * 地形メーカー
     */
    terrainManager: TerrainMakerManager;
    constructor(){
        this.terrainManager = new TerrainMakerManager();
    }

    setPosition(id: string, position: Vector3){
        const target = this.oms.find(om => om.id == id);
        target.args.position = new Vector3().copy(position);
    }

    setScale(id: string, scale: Vector3){
        const target = this.oms.find(om => om.id == id);
        target.args.scale = new Vector3().copy(scale);
    }

    setRotation(id: string, rotation: Euler){
        const target = this.oms.find(om => om.id == id);
        target.args.rotation = new Euler().copy(rotation);
    }

    getPosition(id: string){
        const target = this.oms.find(om => om.id == id);
        if (!target) return null;
        return target.args.position;
    }

    getRotation(id: string){
        const target = this.oms.find(om => om.id == id);
        return target.args.rotation;
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

    getSelectObjects = () => {
        const data = this.oms.filter(om => this.selectedIds.includes(om.object.uuid))
        return data;
    }

    selectObject(id: string){
        if (!this.selectedIds.includes(id)){
            this.selectedIds.push(id);
        }
    }
    unSelectObject(id: string){
        const newArr = this.selectedIds.filter(sid => sid !== id)
        this.selectedIds = newArr
    }

    /**
     * 設定ファイルを読み込む
     */
    importSettingJson(){}

    /**
     * 設定ファイルを吐き出す
     */
    exportSettingJson(){}
}

export const NaniwaEditorContext = createContext<NaniwaEditorManager>(null);