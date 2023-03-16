import { AnimationClip, AnimationMixer, Euler, Group, Matrix4, Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { createContext } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { IObjectManagement, IUIManagement } from "@/engine/Core/NaniwaProps";
import { TerrainMakerManager } from "../TerrainMaker/TerrainMakerManager";
import { GLTFExporter, GLTFExporterOptions } from "three/examples/jsm/exporters/GLTFExporter";
import { rtdp } from "@/commons/functional";

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

interface IPlayerManager {
  type: "avatar" | "other" | "npc";
  selectAnim: string;
  height: number;
  animations: AnimationClip[];
  object: Object3D | Group ;
  animMapper: { [key: string]: string };
  sounds: { [key: string]: string }[];
  args:  { [key: string]: any };
  
}

export class NaniwaEditorManager {
  oms: IObjectManagement[] = []; //Canvas表示系
  uis: IUIManagement[] = [];// 操作UI系
  attr: {[key: string] : any} = {};//その他任意属性
  camera: OrbitControlsImpl;
  transformDecimal: number = 2; 
  /**
   * コンテンツブラウザ
   */
  mode: "position" | "scale" | "rotation" = "position";
  selectedId: string = null;
  gltfViewerObj: Object3D;
  wireFrameColor = "#43D9D9";
  fileSelect: string = "";
  assetRoute: string = "";
  contentsSelect: boolean = false;
  contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" | "avt" = null;
  contentsSelectPath: string = "";// コンテンツブラウザ内のItemを選択した時にパスを設定する
  /**
   * 地形メーカー
   */
  terrainManager: TerrainMakerManager;
  /**
   * プレイヤーパラメータ
   */
  playerManager: IPlayerManager = {
    type: "avatar",
    selectAnim: null,
    height: 1.7,
    animations: [],
    object: null,
    animMapper: null,
    sounds: [],
    args: {}
  }

  constructor() {
    this.terrainManager = new TerrainMakerManager();
  }
  

  /**
   * カメラをセット
   */
  setCamera = (camera: OrbitControlsImpl) => {
    this.camera = camera;
  }

  /**
   * playerManagerをセット
   * @returns playerManager
   */
  setPlayerManager = (pm: IPlayerManager) => {
    this.playerManager = pm;
  }

  /**
   * playerManagerを返す
   * @returns playerManager
   */
  getPlayerManager = () => {
    return this.playerManager;
  }

  /**
   * アニメーションを選択
   */
  setSelectPlayerAnimation = (animName: string) => {
    this.playerManager.selectAnim = animName
  }
   /**
   * アニメーションを変更
   */
  getSelectPlayerAnimation = () => {
    return this.playerManager.selectAnim;
  }

  /**
   * 特定のObjectのMatrinx4を変更
   * @param id 
   * @param position 
   */
  setMatrix4(id: string, matrix: Matrix4) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.matrix = matrix;
    }
  }

  /**
   * 特定のObjectのPositionを変更
   * @param id 
   * @param position 
   */
  setPosition(id: string, position: Vector3) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.position = new Vector3().set(
        rtdp(position.x, this.transformDecimal),
        rtdp(position.y, this.transformDecimal),
        rtdp(position.z, this.transformDecimal)
      );
    }
  }

  /**
   * 特定のObjectのScaleを変更
   * @param id 
   * @param position
   */
  setScale(id: string, scale: Vector3) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.scale = new Vector3().set(
        rtdp(scale.x, this.transformDecimal),
        rtdp(scale.y, this.transformDecimal),
        rtdp(scale.z, this.transformDecimal)
      );
    }
  }

  /**
   * 特定のObjectのRotationを変更
   * @param id 
   * @param rotation
   */
  setRotation(id: string, rotation: Euler) {
    const target = this.oms.find(om => om.id == id);
    if (target) {
      target.args.rotation = new Euler().set(
        rtdp(rotation.x, this.transformDecimal),
        rtdp(rotation.y, this.transformDecimal),
        rtdp(rotation.z, this.transformDecimal)
      );
    }
  }

  /**
   * 特定のオブジェクトのPositionを取得
   * @param id 
   * @returns 
   */
  getPosition(id: string) {
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.position) {
      return new Vector3(0, 0, 0);
    }
    return target.args.position;
  }

  /**
   * 特定のオブジェクトの回転率を取得
   * @param id 
   * @returns 
   */
  getRotation(id: string) {
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.rotation) {
      return new Euler(0, 0, 0);
    }
    return target.args.rotation;
  }

  /**
   * 特定のオブジェクトの回転率を取得
   * @param id 
   * @returns 
   */
  getScale(id: string) {
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.scale) {
      return new Vector3(0, 0, 0);
    }
    return target.args.scale;
  }

  /**
   * 特定のOMにObejctをセットする
   * @returns 
   */
  setOMofObject(id, obj){
    if (this.oms.find(om => om.id == id)) {
      this.oms.find(om => om.id == id).object = obj;
    }
  }

  /**
   * 全てのOMを取得
   */
  getObjectManagements = (): IObjectManagement[] => {
    return this.oms;
  }

  /**
   * OMの追加
   * @param props 
   */
  setObjectManagement = (props: IObjectManagement) => {
    this.oms.push(props);
  }

  /**
   * 選択中のOMを取得する
   * @returns 
   */
  getSelectOM = (): IObjectManagement => {
    const data = this.oms.find(om => this.selectedId == om.id)
    return data;
  }

  /**
   * 現在選択中のIDを取得
   * @returns 
   */
  getSelectId = ():string => {
    return this.selectedId;
  }

  /**
   * 全てのStaticObjectを取得する
   * @returns 
   */
  getStaticObjects = (): IObjectManagement[] => {
    const data = this.oms.filter(om => om.type == "object");
    return data;
  }

  /**
   * 全てのLightを取得する
   * @returns 
   */
  getLights = (): IObjectManagement[] => {
    const data = this.oms.filter(om => om.type == "light");
    return data;
  }

  /**
   * Terrainを取得する
   * @returns 
   */
  getTerrain = (): IObjectManagement => {
    const data = this.oms.find(om => om.type == "terrain");
    return data;
  }

   /**
   * Avatarを取得する
   * @returns 
   */
   getAvatar = (): IObjectManagement => {
    const data = this.oms.find(om => om.type == "avatar");
    return data;
  }

  /**
   * 空を取得
   * @param trig 
   */
  getSky = (): IObjectManagement => {
    const data = this.oms.find(om => om.type == "sky");
    return data;
  }

  /**
   * カメラを停止稼働の切り替え
   */
  setEnabledCamera = (trig: boolean) => {
    this.camera.enabled = trig;
  }

  /**
   * カメラの状態を取得
   */
  getEnabledCamera = (): boolean => {
    return this.camera.enabled;
  };

  getObjectById = (id: string): Object3D => {
    const data = this.oms.find(om => om.id == id);
    if (!data) return null;
    return data.object;
  }
  selectObject = (id: string) => {
    this.selectedId = id;
  }
  unSelectObject = (id: string) => {
    this.selectedId = null;
  }

  /**
   * 全てのUIを取得する
   */
  getAllUIs = () => {
    return this.uis;
  }

  /**
   * 特定のUIをセットする
   */
  setUI(){
  }

  /**
   * 特定のObjectをBlobに変換する
   */
  convertObjectToBlob = (scene): Promise<Blob> => {
      return new Promise((resolve) => {
        var exporter = new GLTFExporter();
        const options: GLTFExporterOptions = {
          binary: true,
          maxTextureSize: 4096,
          animations: scene.animations,
          includeCustomExtensions: true
        };
        exporter.parse(
          scene,
          (result) => {
            if (result instanceof ArrayBuffer) {
              return resolve(this.saveArrayBuffer(result));
            }
            else {
              const output = JSON.stringify(result, null, 2);
              return resolve(this.saveString(output));
            }
          },
          (error: ErrorEvent) => {
            console.log(`出力中エラー: ${error.toString()}`);
          }
        , options);
      });
  }
  saveString(text: string): Blob {
    return new Blob([text], { type: 'text/plain' });
  }
  saveArrayBuffer(buffer: ArrayBuffer): Blob {
    return new Blob([buffer], { type: "application/octet-stream" });
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