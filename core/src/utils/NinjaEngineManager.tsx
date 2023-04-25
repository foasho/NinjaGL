import { World } from "./World";
import { IOctree, Octree } from "./Octree";
import { RootState } from "@react-three/fiber";
import { AutoGltfLoader, AvatarDataSetter, AvatarLoader, TerrainLoader } from "./NinjaLoaders";
import { IConfigParams, IInputMovement, IObjectManagement, IScriptManagement, ISetSoundOption, ISoundProps, ITextureManagement, IUIManagement, IUpdateSoundOption } from "./NinjaProps";
import { AvatarController } from "./AvatarController";
import React, { createContext, useState, useEffect } from "react";
import { AnimationClip, AnimationMixer, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, Audio, AudioListener, AudioLoader, LoopOnce, MathUtils, Quaternion, Euler, Vector2, SkinnedMesh, Box3 } from "three";
import { NinjaShader } from "./NinjaShader";
import { NJCFile, loadNJCFile, loadNJCFileFromURL } from "./NinjaFileControl";
import { InitDesktopConfipParams, InitMobileConfipParams, InitTabletConfipParams } from "./NinjaInit";
import { NinjaEngineWorker } from "./NinjaEngineWorker";

export class NinjaEngine {
  loadingPercentages: number = 0;
  cameraLayer: number = 1;
  possibleLayers: number[] = [];
  config: IConfigParams = InitMobileConfipParams;
  nowLoading: boolean = false;
  loadCompleted: boolean = false;
  deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  useGPU: boolean = false;
  memory: { totalHeap: number, usedHeap: number, availableHeap: number } = {
    totalHeap: 0,
    usedHeap: 0,
    availableHeap: 0
  }
  oms: IObjectManagement[] = [];
  ums: IUIManagement[] = [];
  tms: ITextureManagement[] = [];
  sms: IScriptManagement[] = [];
  world: World;
  octree: Octree;
  avatar: AvatarController;
  camera: PerspectiveCamera | OrthographicCamera;
  listener: AudioListener = new AudioListener();
  sounds: ISoundProps[] = [];
  shader: NinjaShader = new NinjaShader();
  viewableKeys: string[] = []; // 可視化管理
  moveOrderKeys: string[] = []; // 動態管理
  ui: any = null; // UIリスト
  debugTree: any = {}; // デバッグ用のツリー
  // Canvasのサイズ
  canvasSize: Vector2 = new Vector2(0, 0);
  canvasPos: Vector2 = new Vector2(0, 0);
  /**
   * Workerのインスタンス
   */
  workerInstance: NinjaEngineWorker;

  /**
   * コンストラクタ
   */
  constructor() {
    // WebWorkerのインスタンスを生成
    this.workerInstance = new NinjaEngineWorker(this);
  }

  /**
   * 初期化
   */
  async initialize() {
    this.config = this.config? this.config: InitMobileConfipParams;
    this.detectDevice();// デバイスを検出
    if (this.config.autoScale){
      // AutoScaleが有効の場合デバイスに合わせて設定を変更する
      this.setConfigFromDevice();
    }
    if (this.config.physics === "octree"){
      this.world = new World();
      this.octree = new Octree({
        min: new Vector3(
          -this.config.mapsize / 2,
          -this.config.mapsize / 2,
          -this.config.mapsize / 2
        ),
        max: new Vector3(
          this.config.mapsize / 2,
          this.config.mapsize / 2,
          this.config.mapsize / 2
        ),
        maxDepth: this.config.octreeDepth
      } as IOctree);
      this.world.addOctree(this.octree);
    }
    this.possibleLayers = [...Array((this.config.layerGridNum * this.config.layerGridNum))].map((_, idx) => { return idx + 1 });
    await this.initializeLoadOMs();
    this.runScriptsInitialize();
  }

  /**
   * 設定を反映する
   * @param x 
   * @param y 
   */
  setConfig = (config: IConfigParams) => {
    this.config = config;
  }

  /**
   * Canvasのサイズをセットする
   */
  setCanvasSize = (x: number, y: number) => {
    this.canvasSize.set(x, y);
  }
  setCanvasPos = (x: number, y: number) => {
    this.canvasPos.set(x, y);
  }
  /**
   * Canvasのサイズを取得する
   */
  getCanvasSize = (): Vector2 => {
    return this.canvasSize;
  }
  getCanvasPos = (): Vector2 => {
    return this.canvasPos;
  }

  getLoadingPercentages = (): number => {
    return this.loadingPercentages;
  }
  getNowLoading = (): boolean => {
    return this.nowLoading;
  }
  getLoadCompleted = (): boolean => {
    return this.loadCompleted;
  }

  /**
   * 接続デバイスを検出
   */
  detectDevice = () => {
    const ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || (ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0)) {
      this.deviceType = "mobile";
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
      this.deviceType = "tablet";
    } else {
      this.deviceType = "desktop";
    }
  }

  /**
   * 接続デバイスから設定を変更する
   */
  setConfigFromDevice = () => {
    if (this.deviceType === "mobile") {
      this.config = InitMobileConfipParams;
    } else if (this.deviceType === "tablet") {
      this.config = InitTabletConfipParams;
    } else {
      this.config = InitDesktopConfipParams;
    }
  }

  /**
   * NJCをセットする
   */
  setNJCFile = async (njcFile: NJCFile) => {
    this.oms = njcFile.oms;
    this.ums = njcFile.ums;
    this.tms = njcFile.tms;
    this.sms = njcFile.sms;
    if (njcFile.config){
      this.config = njcFile.config;
    }
    // await this.setSMsInWorker();
    // await this.initialize();
    // this.loadCompleted = true;
    // console.info("NinjaEngine: << Complete NJC File >>");
    // this.notifyNJCChanged();
  }
  private njcChangedListeners: (() => void)[] = [];
  onNJCChanged(listener: () => void) {
    this.njcChangedListeners.push(listener);
  }
  offNJCChanged(listener: () => void) {
    this.njcChangedListeners = this.njcChangedListeners.filter(
      l =>  l !== listener
    );
  }
  protected notifyNJCChanged() {
    this.njcChangedListeners.forEach(l => l());
  }

  /**
   * ユーザースクリプトを読み込む
   */
  private async setSMsInWorker(): Promise<void> {
    if (this.workerInstance){
      await this.workerInstance.loadUserScript(this.sms);
    }
  }

  /**
   * 単純にJsonファイルを読み込む
   * @param path 
   * @returns 
   */
  loadJson = (path: string): Promise<any> => {
    return new Promise((resolve) => {
      fetch(path)
        .then(response => response.json())
        .then(result => {
          return resolve(result);
        });
    })
  }

  /**
   * OMsの初期設定を行う
   */
  initializeLoadOMs = async () => {
    await Promise.all(this.oms.map(async (om) => {
      if (om.type === "avatar" && om.object) {
        const animations = om.animations;
        if (animations && animations.length > 0){
          const mixer = new AnimationMixer(om.object);
          om.mixer = mixer;
        }
        om.object.name = "avatar";// Avatarは”avatar”と必ず命名※RTCで使用
      }
      else if (om.type == "terrain" && om.object){
        om.object.traverse((node: any) => {
          if (node.isMesh && node instanceof Mesh){
            node.updateMatrix();
            node.geometry.applyMatrix4(node.matrix);
            // --- 見た目上の回転を正として、回転率を0に戻す
            node.quaternion.copy(new Quaternion().setFromEuler(node.rotation));
            node.rotation.set(0, 0, 0);
            // ----
            node.castShadow = true;
            node.receiveShadow = true;
          }
        })
        if (this.octree){
          this.octree.importThreeObj3D(om.id, om.object, om.type);
        }
      }
      else if (om.type == "object"){
        if (this.octree && om.object){
          // this.octree.importThreeObj3D(om.id, om.object, om.type);
        }
        if (om.args.position && om.object){
          // 物理エンジンへのImportは後で実装
          // const pos = om.args.position;
          // const posVec = new Vector3(pos.x, pos.y, pos.z);
          // if (this.octree){
          //   this.octree.translateFaceByName(om.id, posVec.clone());
          // }
          // om.layerNum = this.getLayerNumber(pos);
        }
      }
      else if (om.type == "three"){
        if (om.args.type == "box"){}
        else if (om.args.type == "sphere"){}
        else if (om.args.type == "cylinder"){}
        else if (om.args.type == "plane"){}
        else if (om.args.type == "capsule"){}
        else if (om.args.type == "cone"){}
        else if (om.args.type == "torus"){}
        if (om.physics !== "none"){
          if (om.physics == "aabb" && om.object instanceof Object3D){
            const aabb = new Box3();
            aabb.setFromObject(om.object);
            if (this.octree){
              this.octree.importAABB(om.id, aabb, om.args.type);
            }
          }
          else if (om.physics == "along" && om.object instanceof Object3D){
            if (this.octree){
              this.octree.importThreeObj3D(om.id, om.object, om.args.type);
            }
          }
          // args.positionがあれば追加したFaceを移動させる
          if (om.args.position){
            const pos = om.args.position;
            const posVec = new Vector3(pos.x, pos.y, pos.z);
            if (this.octree){
              // 現在対応中
              // this.octree.translateFaceByName(om.id, posVec.clone());
            }
            om.layerNum = this.getLayerNumber(pos);
          }
        }
        if (om.layerNum === undefined){
          om.layerNum = this.getLayerNumber(new Vector3(0, 0, 0));
        }
        if (om.visibleType == "force"){
          om.layerNum = 0;
        }
        else if (om.visibleType == "none"){
          om.layerNum = -1;
        }
      }
    }));
  }

  /**
   * プロジェクトデータを読み込む
   * ※ Config, OM, UM, TM, SM
   */
  loadingProjectData = async(NjcFilePath: string):Promise<boolean> => {
    if (this.loadCompleted || this.nowLoading) return false;

    const njcFile = await loadNJCFileFromURL(
      NjcFilePath, 
      (itemsLoaded, itemsTotal) => {
        console.log(`Loaded: ${itemsLoaded}, Total: ${itemsTotal}`);
        this.loadingFileState(itemsLoaded, itemsTotal);
      }
    );
    this.setNJCFile(njcFile);
    console.log("--- 全設定ファイルの読み込み完了 ---");
    this.nowLoading = false;
    this.loadCompleted = true;
    this.initialize();
    return true;
  }

  /**
   * ロード状況を更新する
   */
  loadingFileState = async(updateSize: number, totalSize: number) => {
    this.loadingPercentages = 100 * Number((updateSize / totalSize).toFixed(2));
  }

  /**
   * 特定のIDのOMを取得する
   * @param id 
   * @returns 
   */
  getOMById(id: string): IObjectManagement | undefined {
    return this.oms.find(om => om.id == id);
  }
  /**
   * 特定の名前のOMを取得する
   */
  getOMByName(name: string): IObjectManagement | undefined {
    return this.oms.find(om => om.name == name);
  }

  /**
   * 特定のOMにObject3Dをセットする
   */
  setOMObjectById(id: string, object: Object3D) {
    const om = this.getOMById(id);
    if (om) {
      om.object = object;
    }
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
   * 特定のIDのサウンドを取得する
   */
  getSoundById(id: string): ISoundProps | undefined {
    return this.sounds.find(sound => sound.id == id);
  }

  /**
   * 新しいサウンドをセットする
   */
  setSoundById(params: ISetSoundOption) {
    const sound = new Audio(this.listener);
    const audioLoader = new AudioLoader();
    audioLoader.load(
      params.filePath,
      (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(params.loop);
        sound.setVolume(params.volume);
        sound.pause();
      }
    )
    this.sounds.push({
      id: params.id,
      key: params.key,
      sound: sound,
      loop: params.loop,
      filePath: params.filePath,
      volume: params.volume,
      trigAnim: params.trigAnim,
      stopAnim: params.stopAnim
    });
  }

  /**
   * 特定のIDのサウンドを再生する
   */
  playSoundById(id: string) {
    const sound = this.getSoundById(id);
    if (sound && !sound.sound.isPlaying) {
      sound.sound.play();
    }
  }

  /**
   * 特定のIDのサウンドを停止する
   */
  stopSoundById(id: string) {
    const sound = this.getSoundById(id);
    if (sound) {
      sound.sound.stop();
    }
  }

  /**
   * 特定のIDのサウンドを一時停止する
   */
  pauseSoundById(id: string) {
    const sound = this.getSoundById(id);
    if (sound) {
      sound.sound.pause();
    }
  }
  

  /**
   * アバターのオブジェクトマネジメントを取得
   */
  getAvatar(): IObjectManagement {
    return this.oms.find(om => om.type == "avatar");
  }
  private avatarChangedListeners: (() => void)[] = [];
  onAvatarChanged(listener: () => void) {
    this.avatarChangedListeners.push(listener);
  }
  offAvatarChanged(listener: () => void) {
    this.avatarChangedListeners = this.avatarChangedListeners.filter(
      l => l !== listener
    );
  }
  protected notifyAvatarChanged() {
    this.avatarChangedListeners.forEach(l => l());
  }

  /**
   * アバターをセットする
   */
  setAvatar(threeMesh: Mesh|Object3D) {
    const avatarOM = this.getAvatar();
    if (avatarOM) {
      // Avatarコンポネント側で対応する
      // if (avatarOM.args.position) {
      //   threeMesh.position.set(
      //     avatarOM.args.position.x,
      //     avatarOM.args.position.y,
      //     avatarOM.args.position.z
      //   );   
      // }
      // if (avatarOM.args.rotation) {
      //   threeMesh.quaternion.copy(
      //     new Quaternion().setFromEuler(new Euler(
      //       0,
      //       MathUtils.degToRad(avatarOM.args.rotation.y),
      //       0
      //     ))
      //   );
      // }
      const aabb = new Box3().setFromObject(threeMesh.clone());
      const raduis = aabb.getSize(new Vector3());
      console.log("raduis", raduis);
      // 円は中心でできるので、Meshの位置を調整する
      threeMesh.position.add(new Vector3(0, -raduis.y/2, 0));
      
      this.avatar = new AvatarController(
        this,
        threeMesh,
        raduis.y / 2,
        avatarOM.animations,
        avatarOM.mixer,
        avatarOM.args.animMapper,
        avatarOM.args.sounds
      );
      // Offsetをセットする
      if (avatarOM.args.offsetParams) {
        this.avatar.setOffsetParams(
          avatarOM.args.offsetParams
        );
      }
      // CameraModeをセットする
      if (avatarOM.args.defaultMode) {
        this.avatar.changeCameraMode(
          avatarOM.args.defaultMode
        )
      }
      // 物理世界に対応させる
      if (this.world){
        this.world.addAvatar(this.avatar);
      }
      if (this.camera) {
        this.avatar.setCamera(this.camera);
      }
    }
  }

  /**
   * アバター用カメラをセットする
   * @param camera 
   */
  setAvatarCamera(camera: any) {
    this.camera = camera;
    if (this.avatar) {
      this.avatar.setCamera(this.camera);
    }
    // Listenerをセットする
    // this.camera.add(this.listener);
  }

  /**
   * カメラを取得する
   */
  getCameras = () => {
    const cameras = this.oms.filter(om => om.type == "camera");
    return cameras;
  }

  /**
   * 地形データを取得する
   */
  getTerrain(): IObjectManagement {
    return this.oms.find(om => om.type == "terrain");
  }

  /**
   * そらデータを取得する
   */
  getSky(): IObjectManagement {
    return this.oms.find(om => om.type == "sky");
  }
  /**
   * Skyの変更リスナー
   */
  private skyChangedListeners: (() => void)[] = [];
  onSkyChanged(listener: () => void) {
    this.skyChangedListeners.push(listener);
  }
  offSkyChanged(listener: () => void) {
    this.skyChangedListeners = this.skyChangedListeners.filter(
      l => l !== listener
    );
  }
  protected notifySkyChanged() {
    this.skyChangedListeners.forEach(l => l());
  }

  /**
   * 雲データを取得する
   */
  getCloud(): IObjectManagement {
    return this.oms.find(om => om.type == "cloud");
  }

  /**
   * Environmentデータを取得する
   */
  getEnvironment(): IObjectManagement {
    return this.oms.find(om => om.type == "environment");
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
   * 通常オブジェクトを取得する
   */
  getStaticObjects(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "object");
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
   * 光源データを取得する
   */
  getLights(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "light");
  }
  /**
   * 光源の変更リスナー
   */
  private LightsChangedListeners: (() => void)[] = [];
  onLightsChanged(listener: () => void) {
    this.LightsChangedListeners.push(listener);
  }
  offLightsChanged(listener: () => void) {
    this.LightsChangedListeners = this.LightsChangedListeners.filter(
      l => l !== listener
    );
  }
  // OMの変更を通知する
  protected notifyLightsChanged() {
    this.LightsChangedListeners.forEach(l => l());
  }

  /**
   * テキストデータを取得する
   */
  getTexts(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "text");
  }

  /**
   * テキスト3Dデータを取得する
   */
  getTexts3D(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "text3d");
  }

  /**
   * Threeデータを取得する
  */
  getThreeObjects(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "three");
  }

  
  /**
   * LFデータを取得する
   */
  getLightFormers(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "lightformer");
  }
  /**
   * LFの変更リスナー
   */
  private LightFormersChangedListeners: (() => void)[] = [];
  onLightFormers(listener: () => void) {
    this.LightFormersChangedListeners.push(listener);
  }
  offLightFormers(listener: () => void) {
    this.LightFormersChangedListeners = this.LightFormersChangedListeners.filter(
      l => l !== listener
    );
  }
  protected notifyLightFormersChanged() {
    this.LightFormersChangedListeners.forEach(l => l());
  }



  /**
   * エフェクトデータを取得する
   */
  getEffects(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "effect");
  }
  /**
   * エフェクトの変更リスナー
   */
  private EffectsChangedListeners: (() => void)[] = [];
  onEffectsChanged(listener: () => void) {
    this.EffectsChangedListeners.push(listener);
  }
  offEffectsChanged(listener: () => void) {
    this.EffectsChangedListeners = this.EffectsChangedListeners.filter(
      l => l !== listener
    );
  }
  protected notifyEffectsChanged() {
    this.EffectsChangedListeners.forEach(l => l());
  }



  /**
 * サウンドをセットする
 */
  setSound(params: ISetSoundOption) {
    const sound = new Audio(this.listener);
    const audioLoader = new AudioLoader();
    audioLoader.load(
      params.filePath,
      (buffer) => {
        sound.setBuffer(buffer);
        sound.setLoop(params.loop);
        sound.setVolume(params.volume);
      }
    )
  }

  /**
   * サウンドを更新
   */
  updateSound(params: IUpdateSoundOption) {
    const sound = this.sounds.find(s => s.key == params.key);
    if (sound) {
      if (params.volume) {
        sound.sound.setVolume(params.volume);
      }
      if (params.loop !== undefined) {
        sound.sound.setLoop(params.loop);
      }
    }
  }

  /**
   * 特定のサウンドを鳴らせる
   */
  playSound(key: string) {
    const sound = this.sounds.find(s => s.key == key);
    if (sound && !sound.sound.isPlaying) {
      sound.sound.play();
    }
  }

  /**
   * 特定のサウンドを止める
   */
  stopSound(key: string) {
    const sound = this.sounds.find(s => s.key == key);
    if (sound) {
      sound.sound.pause();
    }
  }

  /**
 * すべてのサウンドを止める
 */
  removeSoundAll() {
    this.sounds.map((sound) => {
      sound.sound.pause();
      sound.sound.remove();
    });
  }

  /**
   * 現在のレイヤーから可視する周辺のレイヤー番号を取得する
   */
  getActiveLayers(
    layerNum: number,
    layerGrid: number = this.config.layerGridNum,
    layerLength: number = this.config.viewGridLength,
  ) {
    const l = layerLength;
    const g = layerGrid;
    const n = layerNum;
  
    const r = (n - 1) % g; // 現在レイヤーの列番号
    const c = Math.ceil((n - 1) / g); // 現在レイヤーの行番号
    const layers = [n];
  
    Array.from({ length: l }).map((_, idx) => {
      const i = idx + 1;
      // 中心
      layers.push((c - 1 - i) * g + r);
      layers.push((c - 1 + i) * g + r);
      layers.push((c - 1) * g + (r - i));
      layers.push((c - 1) * g + (r + i));
  
      // 周辺
      Array.from({ length: l - i }).map((_none, _idx) => {
        const _i = _idx + 1;
        layers.push((c - 1 - _i) * g + (r - _i));
        layers.push((c - 1 + _i) * g + (r - _i));
        layers.push((c - 1 - _i) * g + (r + _i));
        layers.push((c - 1 + _i) * g + (r + _i));
      });
  
    });
  
    // はみ出たレイヤーは削除する
    const availableLayers = layers.filter(layerNo => this.possibleLayers.includes(layerNo));
    return availableLayers;
  }
  

  /**
   * 特定のPositionからレイヤー番号を取得する
   */
  getLayerNumber(
    pos: Vector3, 
    worldSize: number = this.config.mapsize,
    layerGrid: number = this.config.layerGridNum
  ): number {
    const layerXLen = worldSize / layerGrid;
    const layerZLen = worldSize / layerGrid;
    const cx = worldSize / 2;
    const cz = worldSize / 2;
    if (cx < Math.abs(pos.x)) return -1; // ワールド範囲外X方向
    if (cz < Math.abs(pos.z)) return -1; // ワールド範囲外Z方向
    const px = pos.x + cx;
    const pz = pos.z + cz;
    // const r = Math.ceil(px / layerXLen);
    const r = Math.ceil((worldSize - px) / layerXLen); // この行を修正しました
    const c = Math.ceil((worldSize - pz) / layerZLen);
    const layer = (c - 1) * layerGrid + r;
    return layer;
  }

  /**
   * 特定のレイヤーの中心座標を取得する
   */
  getCenterPosFromLayer(
    layer: number, 
    yPos: number = 0.5, 
    worldSize: number=this.config.mapsize, 
    layerGrid:number = this.config.layerGridNum
  ): Vector3 {
    const layerXLen = worldSize / layerGrid;
    const layerZLen = worldSize / layerGrid;
    const cx = worldSize / 2;
    const cz = worldSize / 2;
    const c = Math.ceil(layer/layerGrid);
    let r = (layer) % (layerGrid);
    if (r === 0) r = layerGrid;
    const absPosX = (layerGrid - r) * layerXLen;
    const absPosZ = (c-1) * layerZLen;
    const worldXZ = [
      absPosX - cx + layerXLen / 2,
      - absPosZ + cz - layerZLen/2
    ];
    return new Vector3(worldXZ[0], yPos, worldXZ[1]);
  }

  /**
   * 特定のIDと新しいPositionからOMのレイヤー番号を更新する
   */
  updateLayerNumber(id: string, pos: Vector3) {
    const layer = this.getLayerNumber(pos);
    if (layer !== undefined) {
      const om = this.oms.find(om => om.id == id);
      if (om) {
        om.layerNum = layer;
      }
    }
  }

  /**
   * アバターのレイヤー番号を更新する
   */
  updateAvatarLayerNumber() {
    const avatar = this.getAvatar();
    if (avatar && this.avatar) {
      const id = avatar.id;
      const nowposition = this.avatar.object.position.clone();
      this.updateLayerNumber(id, nowposition);
    }
  }

  /**
   * 可視上オブジェクトの更新
   */
  updateViewableObject() {
    if (this.camera !== undefined) {
      const nowCameraLayer = this.getLayerNumber(this.camera.position);
      if (nowCameraLayer !== this.cameraLayer){
        const visibleLayers = this.getActiveLayers(nowCameraLayer);
        visibleLayers.push(0);
        if (this.avatar){
          const nowAvatarLayer = this.getLayerNumber(this.avatar.object.position.clone());
          visibleLayers.push(nowAvatarLayer);
        }
        visibleLayers.map((layerNum) => {
          // 見える範囲は表示する
          this.camera?.layers.enable(layerNum);
        });
        const disableLayers = this.possibleLayers.filter(layerNum => !visibleLayers.includes(layerNum));
        // みえない範囲を非表示にする
        disableLayers.map((layerNum) => {
            // this.camera?.layers.disable(layerNum);
        });
        this.cameraLayer = nowCameraLayer;
        this.camera.layers.enable(0);
      }
    }
  }

  /**
   * LoopAnimationを実行する
   */
  loopAnimation(timeDelta: number) {
    this.oms.map(om => {
      if (om.args.defaultAnimation && om.animations.length > 0 && om.mixer) {
        om.mixer.update(timeDelta);
      }
    });
  }

  /**
   * ユーザースクリプトの初期関数を実行する
   */
  runScriptsInitialize() {
    console.log("Start runScriptsInitialize");
    this.sms.map(sm => {
      this.workerInstance.runInitialize(
        sm.id
      );
    });
  }

  /**
   * ユーザースクリプトのフレームループを実行する
   */
  runScriptsFrameLoop(state: RootState, delta: number, input: IInputMovement) {
    this.sms.map(sm => {
      this.workerInstance.runFrameLoop(
        sm.id,
        state,
        delta,
        input
      );
    });
  }

  /**
   * フレームによる更新
   * @param timeDelta 
   * @param input 
   */
  frameUpdate(state: RootState, timeDelta: number, input: IInputMovement) {
    if (this.loadCompleted) {
      // アバターのレイヤー番号を更新する
      // this.updateAvatarLayerNumber();
      // 可視上のオブジェクトを更新する
      // this.updateViewableObject();
      // 物理ワールドを更新する
      if (this.world) this.world.step(timeDelta, input);
      // ループアニメーションがあれば更新する
      this.loopAnimation(timeDelta);
      // 動態管理をリフレッシュする
      this.moveOrderKeys = [];
      // スクリプトを実行する
      if (this.workerInstance) this.runScriptsFrameLoop(state, timeDelta, input);
    }
  }

  debugFrameUpdate(timeDelta: number, params: any) {
    if (this.config.isDebug){
      console.log("debugFrameUpdate");
      this.debugTree = [...this.oms];
    }
  }

  getDebugTree() {
    return this.debugTree;
  }

}

export const NinjaEngineContext = createContext<NinjaEngine>(undefined);

export const NinjaEngineProvider = ({ children }) => {
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    const _engine = new NinjaEngine();
    setEngine(_engine);
  }, []);

  return (
    <NinjaEngineContext.Provider value={engine}>
      {children}
    </NinjaEngineContext.Provider>
  )
};