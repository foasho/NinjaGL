import { AnimationClip, AnimationMixer, Euler, Group, Material, Matrix4, Object3D, Vector3, WebGLRenderer } from "three";
import { createContext } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { IConfigParams, IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from "@/core/utils/NinjaProps";
import { TerrainMakerManager } from "./ViewPort/TerrainMakerManager";
import { NJCFile } from "@/core/utils/NinjaFileControl";
import { InitMobileConfipParams } from "@/core/utils/NinjaInit";

interface ISetObjectManagement {
  id?: string;
  name?: string;
  type: "three" | "object" | "avatar" | "terrain" | "others" | "sky" | "light";
  visibleType: "auto" | "force" | "none";
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

export class NinjaEditorManager {
  render: WebGLRenderer;
  config: IConfigParams;
  oms: IObjectManagement[] = []; //Canvas表示系
  ums: IUIManagement[] = [];// 操作UI系
  tms: ITextureManagement[] = []; // テクスチャ
  scs: IScriptManagement[] = []; // スクリプト
  attr: {[key: string] : any} = {};//その他任意属性
  camera: OrbitControlsImpl;
  transformDecimal: number = 2; 
  /**
   * コンテンツブラウザ
   */
  mode: "position" | "scale" | "rotation" = "position";
  gltfViewerObj: Object3D;
  wireFrameColor = "#43D9D9";
  fileSelect: string = "";
  assetRoute: string = "";
  contentsSelect: boolean = false;
  contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" | "avt" | "camera" = null;
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
    this.initialize();
  }

  /**
   * 初期化
   */
  initialize = () => {
    this.config = null;
    this.terrainManager = new TerrainMakerManager();
    this.config= InitMobileConfipParams;
    this.oms = [];
    this.ums = [];
    this.camera = null;
    this.tms = [];
  }

  /**
   * レンダラー設定をセット
   * @param config 
   */
  setConfig = (config: IConfigParams) => {
    this.config = config;
  }

  /**
   * マップサイズを設定
   * @param mapSize 
   */
  setConfigMapsize(mapSize: number){
    this.config.mapsize = mapSize;
  }

  /**
   * カメラをセット
   */
  setCamera = (camera: OrbitControlsImpl) => {
    this.camera = camera;
  }
  /**
   * カメラを取得
   */
  getCamera = () => {
    return this.camera;
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
      target.args.position = new Vector3().copy(position);
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
      target.args.scale = new Vector3().copy(scale);
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
      target.args.rotation = new Euler().copy(rotation);
    }
  }

  /**
   * マテリアルを設定する
   * @param id 
   * @param material Material
   */
  setMaterial(id: string, material: Material){
    const target = this.oms.find(om => om.id == id);
    if (target){
      target.args.material = material;
    }
  }

  /**
   * CastShadowを変更
   */
  setCastShadow(id: string, value: boolean){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.castShadow = value;
    }
  }

  /**
   * CastShadowを変更
   */
  setreceiveShadow(id: string, value: boolean){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.receiveShadow = value;
    }
  }

  /**
   * Helper表示の切り替え
   */
  setHelper(id: string, value: boolean){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.helper = value;
    }
  }

  /**
   * 名前を変更
   * @param id 
   * @param value 
   */
  setName(id: string, value: string){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.name = value;
    }
  }

  /**
   * 表示種別を非表示にする
   * @param id 
   * @param value 
   */
  setVisibleType(id: string, visibleType: "none" | "force" | "auto"){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.visibleType = visibleType;
    }
  }

  /**
   * 表示を非表示にする
   * @param id 
   * @param value 
   */
  setVisible(id: string, value: boolean){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.visible = value;
    }
  }

  // Get Function

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
      return new Vector3(1, 1, 1);
    }
    return target.args.scale;
  }

  /**
   * 特定のオブジェクトからマテリアルを取得
   * @param id 
   */
  getMaterial(id: string): Material{
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.material) {
      return null;
    }
    return target.args.material;
  }

  /**
   * CastShadowを取得
   */
  getCastShadow(id: string){
    const target = this.oms.find(om => om.id == id);
    if (!target) {
      return false;
    }
    return target.args.castShadow;
  }

  /**
   * receiveShadowを取得
   */
  getreceiveShadow(id: string){
    const target = this.oms.find(om => om.id == id);
    if (!target) {
      return false;
    }
    return target.args.receiveShadow;
  }

  /**
   * Helperを取得
   */
  getHelper(id: string){
    const target = this.oms.find(om => om.id == id);
    if (!target) {
      return false;
    }
    return target.args.helper;
  }

  /**
   * 表示を非表示にする
   * @param id 
   */
  getVisible(id: string){
    const target = this.oms.find(om => om.id == id);
    if (!target) {
      return false;
    }
    return target.args.visible;
  }


  /** --- OM関係 --- */

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
  // getSelectOM = (): IObjectManagement => {
  //   const data = this.oms.find(om => this.selectedId == om.id)
  //   return data;
  // }

  /**
   * 現在選択中のIDを取得
   * @returns 
   */
  getOMById = (id: string):IObjectManagement => {
    return this.oms.find(om => om.id == id);
  }

  /**
   * 全てのObjectを取得する
   * @returns 
   */
  getObjects = (): IObjectManagement[] => {
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
  removeAvatar = () => {
    this.oms = this.oms.filter(om => om.type !== "avatar");
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
   * Three.js標準のObjectを取得
   * @param trig 
   */
  getThreeObjects = (): IObjectManagement[] => {
    const data = this.oms.filter(om => om.type == "three");
    return data;
  }

  /**
   * 霧を取得
   */
  getFog = (): IObjectManagement => {
    const data = this.oms.find(om => om.type == "fog");
    return data;
  }

  /**
   * カメラ取得
   */
  getCameras = (): IObjectManagement[] => {
    const data = this.oms.filter(om => om.type == "camera");
    return data;
  }

  /**
   * 
   * @returns 
   */
  getOms = () => {
    return this.oms;
  }

  /**
   * 全てのUIを取得する
   */
  getUMs = () => {
    return this.ums;
  }

  /**
   * すべてのTMを取得する
   */
  getTMs= () => {
    return this.tms;
  }

  /**
   * すべてのScriptを取得する
   */
  getSCs= () => {
    return this.scs;
  }

  /**
   * 特定のUIをセットする
   */
  setUI(){
  }

  /**
   * NJCファイルのロード
   * @param njcFile 
   */
  setNJCFile(njcFile: NJCFile){
    this.initialize();
    this.oms = njcFile.oms;
    this.ums = njcFile.ums;
    console.log("<< Complete NJC File >>");
  }
}

export const NinjaEditorContext = createContext<NinjaEditorManager>(null);