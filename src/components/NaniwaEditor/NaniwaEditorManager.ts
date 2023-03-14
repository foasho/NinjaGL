import { AnimationClip, AnimationMixer, Euler, Object3D, Vector3 } from "three";
import { createContext } from "react";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { TerrainMakerManager } from "../TerrainMaker/TerrainMakerManager";

interface ISetObjectManagement {
  id?: string;
  name?: string;
  type: "three" | "object" | "avatar" | "terrain" | "others" | "sky" | "light";
  visiableType: "auto" | "force" | "none";
  layerNum?: number;
  args?: any;
  rules?: any;
  object?: Object3D;
  animations?: AnimationClip[];
  mixer?: AnimationMixer;
}

export class NaniwaEditorManager {
  mode: "position" | "scale" = "position";
  oms: IObjectManagement[] = [];
  selectedIds: string[] = [];
  gltfViewerObj: Object3D;
  wireFrameColor = "#43D9D9";
  /**
   * コンテンツブラウザ
   */
  fileSelect: string = "";
  assetRoute: string = "";
  contentsSelect: boolean = false;
  contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" = null;
  contentsSelectPath: string = "";// コンテンツブラウザ内のItemを選択した時にパスを設定する
  /**
   * 地形メーカー
   */
  terrainManager: TerrainMakerManager;
  constructor() {
    this.terrainManager = new TerrainMakerManager();
  }

  setPosition(id: string, position: Vector3) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.position = new Vector3().copy(position);
    }
  }

  setScale(id: string, scale: Vector3) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.scale = new Vector3().copy(scale);
    }
  }

  setRotation(id: string, rotation: Euler) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.rotation = new Euler().copy(rotation);
    }
  }

  getPosition(id: string) {
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.position) {
      return new Vector3(0, 0, 0);
    }
    return target.args.position;
  }

  getRotation(id: string) {
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.rotation) {
      return new Euler(0, 0, 0);
    }
    return target.args.rotation;
  }

  setObjectManagement = (props: IObjectManagement) => {
    this.oms.push(props);
  }

  getSelectObjects = () => {
    const data = this.oms.filter(om => this.selectedIds.includes(om.object.uuid))
    return data;
  }

  getObjectById(id: string) {
    const data = this.oms.find(om => om.id == id);
    if (!data) return null;
    return data.object;
  }

  selectObject(id: string) {
    if (!this.selectedIds.includes(id)) {
      this.selectedIds.push(id);
    }
  }
  unSelectObject(id: string) {
    const newArr = this.selectedIds.filter(sid => sid !== id)
    this.selectedIds = newArr
  }

  /**
   * 設定ファイルを読み込む
   */
  importSettingJson() { }

  /**
   * 設定ファイルを吐き出す
   */
  exportSettingJson() { }
}

export const NaniwaEditorContext = createContext<NaniwaEditorManager>(null);