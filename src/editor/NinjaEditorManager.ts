import { AnimationClip, AnimationMixer, Euler, Group, Material, Matrix4, Object3D, Vector3, WebGLRenderer } from "three";
import { createContext } from "react";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { IConfigParams, IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from "ninja-core";
import { NJCFile } from "ninja-core";
import { InitMobileConfipParams } from "ninja-core";

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

/**
 * Ninjaエディタクラス
 */
export class NinjaEditorManager {
  config: IConfigParams = InitMobileConfipParams;
  oms: IObjectManagement[] = []; //Canvas表示系
  ums: IUIManagement[] = [];// 操作UI系
  tms: ITextureManagement[] = []; // テクスチャ
  sms: IScriptManagement[] = []; // スクリプト
  attr: {[key: string] : any} = {};//その他任意属性
  camera: OrbitControlsImpl | undefined;
  transformDecimal: number = 2; 
  /**
   * コンテンツブラウザ
   */
  mode: "position" | "scale" | "rotation" = "position";
  gltfViewerObj: Object3D | undefined;
  wireFrameColor = "#43D9D9";
  fileSelect: string = "";
  assetRoute: string = "";
  contentsSelect: boolean = false;
  contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" | "avt" | "camera" | null = null;
  contentsSelectPath: string = "";// コンテンツブラウザ内のItemを選択した時にパスを設定する
  /**
   * プレイヤーパラメータ
   */
  playerManager: IPlayerManager = {
    type: "avatar",
    selectAnim: "idle",
    height: 1.7,
    animations: [],
    object: new Group(),
    animMapper: {},
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
    this.oms = [];
    this.ums = [];
    this.camera = undefined;
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
  setMaterialData(id: string, type: "standard"|"phong"|"tone"|"shader", value: any){
    const target = this.oms.find(om => om.id == id);
    if (target){
      target.args.materialData = {
        type: type,
        value: value
      };
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
   * EnvironmentのPresetを変更
   */
  setEnvironmentPreset(id: string, preset: "sunset" | "forest" | "night" | "dawn" ){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.preset = preset;
      this.notifyEnvChanged();
    }
  }

  /**
   * EnvironmentのBlurを変更
   */
  setEnvironmentBlur(id: string, blur: number){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.blur = blur;
      this.notifyEnvChanged();
    }
  }

  /**
   * EnvironmentのBackgroundフラグを変更
   */
  setEnvironmentBackground(id: string, background: boolean){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.background = background;
      this.notifyEnvChanged();
    }
  }

  /**
   * Formの変更
   */
  setForm(id: string, form: "circle"|"ring"|"rect" ){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.form = form;
      this.notifyEnvChanged();
    }
  }

  /**
   * Intensityを変更
   */
  setIntensity(id: string, intensity: number){
    const target = this.oms.find(om => om.id == id);
    if (id && target) {
      target.args.intensity = intensity;
      this.notifyEnvChanged();
    }
  }

  /**
   * Targetを変更
   */
  setTarget(id: string, name: string, target: Vector3){
    const _target = this.oms.find(om => om.id == id);
    if (id && target) {
      _target.args.target.name = name;
      _target.args.target.data = target;
      this.notifyEnvChanged();
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
  getMaterialData(id: string){
    const target = this.oms.find(om => om.id == id);
    if (!target || !target.args.materialData) {
      return null;
    }
    return target.args.materialData;
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
  setOMofObject(id: string, obj: Object3D){
    const target = this.oms.find(om => om.id == id);
    if (target) {
      if (target.object) {
        target.object.parent.remove(target.object);
      }
      (target as any).object = obj;
    }
  }

  /**
   * OMの追加
   * @param props 
   */
  setOM = (props: IObjectManagement) => {
    this.oms.push(props);
    this.notifyOMsChanged();
  }

  /**
   * SMの追加
   */
  setSM = (props: IScriptManagement): boolean => {
    if (this.sms.find(sm => sm.id == props.id)) {
      return false;
    }
    if (this.sms.find(sm => sm.name == props.name)) {
      return false;
    }
    this.sms.push(props);
    this.notifySMsChanged();
    return true;
  }

  /**
   * 現在選択中のIDを取得
   * @returns 
   */
  getOMById = (id: string):IObjectManagement|undefined => {
    return this.oms.find(om => om.id == id);
  }

  /**
   * 特定のIDのSMを取得する
   * @param id 
   * @returns 
   */
  getSMById(id: string): IScriptManagement | undefined {
    return this.sms.find(sm => sm.id == id);
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
  * StaticObjectの変更リスナー
  */
  private objectChangedListeners: (() => void)[] = [];
  onObjectChanged(listener: () => void) {
    this.objectChangedListeners.push(listener);
  }
  offObjectChanged(listener: () => void) {
    this.objectChangedListeners = this.objectChangedListeners.filter( l => l !== listener );
  }
  protected notifyObjectChanged() {
    this.objectChangedListeners.forEach(l => l());
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
  getTerrain = (): IObjectManagement|undefined => {
    const data = this.oms.find(om => om.type == "terrain");
    return data;
  }

   /**
   * Avatarを取得する
   * @returns 
   */
  getAvatar = (): IObjectManagement|undefined => {
    const data = this.oms.find(om => om.type == "avatar");
    return data;
  }
  removeAvatar = () => {
    this.oms = this.oms.filter(om => om.type !== "avatar");
  }

  /**
   * Skyを取得
   * @param trig 
   */
  getSky = (): IObjectManagement|undefined => {
    const data = this.oms.find(om => om.type == "sky");
    return data;
  }
  /**
   * Skyの変更リスナー
   */
  private skyChangedListeners: (() => void)[] = [];
  onSkyChanged(listener: () => void) {
    this.scriptManagementChangedListeners.push(listener);
  }
  offSkyChanged(listener: () => void) {
    this.scriptManagementChangedListeners = this.scriptManagementChangedListeners.filter(
      l => l !== listener
    );
  }
  protected notifySkyChanged() {
    this.scriptManagementChangedListeners.forEach(l => l());
  }

  /**
   * 雲を取得
   */
  getCloud = (): IObjectManagement|undefined => {
    const data = this.oms.find(om => om.type == "cloud");
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
  getFog = (): IObjectManagement|undefined => {
    const data = this.oms.find(om => om.type == "fog");
    return data;
  }
  /**
  * Fogの変更リスナー
  */
  private fogChangedListeners: (() => void)[] = [];
  onFogChanged(listener: () => void) {
    this.fogChangedListeners.push(listener);
  }
  offFogChanged(listener: () => void) {
    this.fogChangedListeners = this.fogChangedListeners.filter( l => l !== listener );
  }
  protected notifyFogChanged() {
    this.fogChangedListeners.forEach(l => l());
  }

  /**
   * Text取得
   */
  getTexts = (): IObjectManagement[] => {
    const data = this.oms.filter(om => om.type == "text");
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
   * Environmentを取得
   */
  getEnvironment = (): IObjectManagement => {
    const data = this.oms.find(om => om.type == "environment");
    return data;
  }
  /**
  * Environmentの変更リスナー
  */
  private envChangedListeners: (() => void)[] = [];
  onEnvChanged(listener: () => void) {
    this.envChangedListeners.push(listener);
  }
  offEnvChanged(listener: () => void) {
    this.envChangedListeners = this.envChangedListeners.filter( l => l !== listener );
  }
  protected notifyEnvChanged() {
    this.envChangedListeners.forEach(l => l());
  }

  /**
   * LightFormerを取得
   */
  getLightformers = (): IObjectManagement[] => {
    const data = this.oms.filter(om => om.type == "lightformer");
    return data;
  }

  /**
   * 削除処理
   */
  deleteOM = (id: string) => {
    this.oms = this.oms.filter(om => om.id !== id);
    this.notifyOMsChanged();
  }

  /**
   * 全取得系処理
   */

  /**
   * 全てのOMを取得する
   */
  getOMs = () => {
    return this.oms;
  }
    /**
   * OMの変更リスナー
   */
    private objectManagementsChangedListeners: (() => void)[] = [];
    onOMsChanged(listener: () => void) {
      this.objectManagementsChangedListeners.push(listener);
    }
    offOMsChanged(listener: () => void) {
      this.objectManagementsChangedListeners = this.objectManagementsChangedListeners.filter( l => l !== listener );
    }
    // OMの変更を通知する
    protected notifyOMsChanged() {
      this.objectManagementsChangedListeners.forEach(l => l());
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
  getSMs= () => {
    return this.sms;
  }
  /**
   * SMの変更リスナー
   */
  private scriptManagementChangedListeners: (() => void)[] = [];
  onSMsChanged(listener: () => void) {
    this.scriptManagementChangedListeners.push(listener);
  }
  offSMsChanged(listener: () => void) {
    this.scriptManagementChangedListeners = this.scriptManagementChangedListeners.filter(
      l =>  l !== listener
    );
  }
  // SMの変更を通知する
  protected notifySMsChanged() {
    this.scriptManagementChangedListeners.forEach(l => l());
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
    this.notifyOMsChanged();
  }

}

export const NinjaEditorContext = createContext<NinjaEditorManager>(new NinjaEditorManager());