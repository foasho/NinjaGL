import { World } from "./World";
import { Octree } from "./Octree";
import { AutoGltfLoader, AvatarDataSetter, AvatarLoader, TerrainLoader } from "./NinjaLoaders";
import { IConfigParams, IInputMovement, IObjectManagement, IScriptManagement, ISetSoundOption, ISoundProps, ITextureManagement, IUIManagement, IUpdateSoundOption } from "./NinjaProps";
import { AvatarController } from "./AvatarController";
import { createContext } from "react";
import { convertToGB } from "@/commons/functional";
import { AnimationClip, AnimationMixer, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, Audio, AudioListener, AudioLoader, LoopOnce, MathUtils, Quaternion, Euler, Vector2, SkinnedMesh, Box3 } from "three";
import { reqApi } from "@/services/ServciceApi";
import { useInputControl } from "./InputControls";
import { NinjaShader } from "./NinjaShader";
import { NJCFile } from "./NinjaFileControl";
import { InitDesktopConfipParams, InitMobileConfipParams, InitTabletConfipParams } from "./NinjaInit";

let nowLoadedFiles: { [key: string]: number } = { "sample": 0 };
export let totalFileSize: number = 1;
export let loadPer: number = 0;
export let loadingText: string = "ファイルサイズを取得中...";

export class NinjaEngine {
  jsonData: any = null;
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
  scs: IScriptManagement[] = [];
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
  // Canvasのサイズ
  canvasSize: Vector2 = new Vector2(0, 0);
  canvasPos: Vector2 = new Vector2(0, 0);
  // ScriptWorker[ユーザースクリプト]
  worker: Worker; // Web Worker

  /**
   * コンストラクタ
   */
  constructor() { 
    // this.worker = new Worker("worker.js");
    // this.worker.onmessage = (e: MessageEvent) => {
    //   this.handleWorkerMessage(e);
    // }
  }

  /**
   * セットアップ
   */
  allSetup() {
    this.config = InitMobileConfipParams;
    this.detectDevice();
    this.detectGPU();
    this.updateAvailableMemory();
    this.world = new World();
    const L = this.getOctreeL();
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
      maxDepth: L
    });
    this.world.addOctree(this.octree);
    // if (this.deviceType == "tablet") {
    //   this.config = InitTabletConfipParams;
    // }
    // else if (this.deviceType == "desktop") {
    //   this.config = InitDesktopConfipParams;
    // }
    this.possibleLayers = [...Array((this.config.layerGridNum * this.config.layerGridNum))].map((_, idx) => { return idx + 1 });
  }

  /**
   * すべての情報をクリアにする
   */
  allClear = () => {
    this.nowLoading = false;
    this.loadCompleted = false;
    this.useGPU = false;
    this.world = null;
    this.octree = null;
    this.oms = [];
    this.avatar = null;
    this.camera = null;
    this.removeSoundAll();
    this.sounds = [];
  }

  /**
   * 設定を反映する
   * @param x 
   * @param y 
   */
  setConfig = (config: IConfigParams) => {
    if (config.mapsize){
      
    }
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

  /**
   * 設定JSONファイルをセットする
   */
  setJson = async (jsonPath: string) => {
    const data = await this.loadJson(jsonPath);
    this.jsonData = data;
  }
  /**
   * 直接JSONのデータをセットする
   */
  setJsonData = (data: any) => {
    this.jsonData = data;
  }
  /**
   * NJCをセットする
   */
  setNJC = (njcFile: NJCFile) => {
    this.oms = njcFile.oms;
    this.ums = njcFile.ums;
    this.tms = njcFile.tms;
    this.scs = njcFile.scs;
    if (njcFile.config){}
  }

  /**
   * 接続しているデバイス種別を検出
   */
  detectDevice = () => {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    var isTablet = /iPad/i.test(navigator.userAgent);
    var isPC = !isMobile && !isTablet;
    if (isMobile) this.deviceType = "mobile";
    else if (isTablet) this.deviceType = "tablet";
    else if (isPC) this.deviceType = "desktop";
    else {
      console.log(`接続デバイスを検出しましたが、モバイル/タブレット/PCどれにも該当しないようです。詳細${navigator.userAgent.toString()}`);
    }
  }

  /**
   * GPUを使用して描画しているか
   */
  detectGPU = () => {
    if (typeof WebGLRenderingContext !== 'undefined') {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && gl instanceof WebGLRenderingContext) {
        // WebGLがサポートされている場合、GPUが使用されている可能性がある
        this.useGPU = true;
      }
    }
  }

  /**
   * 利用できるメモリ量を更新
   */
  updateAvailableMemory = () => {
    const _performance: any = performance;
    if (_performance && _performance.memory) {
      this.memory = {
        totalHeap: _performance.memory.totalJSHeapSize,
        usedHeap: _performance.memory.usedJSHeapSize,
        availableHeap: _performance.memory.jsHeapSizeLimit
      }
    }
  }


  /**
   * Octreeの段階数(L)を取得
   */
  getOctreeL = (): number => {
    const maxL = 7;
    let n = 0;
    let l = this.config.mapsize;
    for (l; l > 1; l = l / 2) {
      n++;
    }
    const baseL = 5;
    const hpGB = convertToGB(this.memory.availableHeap);
    let L = (n - 5) + Math.round(hpGB ? hpGB : 1 / 2.4) + baseL;
    if (this.deviceType == "desktop") {
      if (L < maxL) {
        L++;
      }
      if (L < maxL) {
        if (this.useGPU) L++;
      }
    }
    if (L >= maxL) {
      L = maxL;
    }
    return L;
  }

  /**
   * OctreeのBox数を取得
   */
  getOctreeS = (L: number): number => {
    let S: number = 0;
    [...Array(L)].map((_, idx) => {
      const i = idx + 1;
      S += Math.pow(8, i);
    });
    return S;
  }

  /**
   * Octreeを再セット
   */

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
   * 設定JSONファイルをImportする
   */
  loadJsonData = async():Promise<boolean> => {
    if (this.loadCompleted || this.nowLoading) return null;
    const jsonData = this.jsonData;
    this.nowLoading = true;
    totalFileSize = 1;
    nowLoadedFiles = {};
    const keys = Object.keys(jsonData);
    await (async () => {
      for await (const key of keys) {
        if (key == "avatar") {
          if (jsonData[key].object){
            const obj: IObjectManagement = {
              ...jsonData[key], 
            }
            // パラメータにisCenterがついていれば半径分ずらす
            if (obj.args.isCenter){
              console.log("Avatar -> isCenter");
              AvatarDataSetter({
                object: obj.object,
                isCenter: true,
                height: obj.args.height
              });
            }
            obj.animations = obj.object.animations;
            const mixer = new AnimationMixer(obj.object);
            obj.mixer = mixer;
            obj.layerNum = 0;
            obj.visibleType = "force";
            this.oms.push(obj);     
          }
        }
        else if (key == "terrain") {
          if (!jsonData[key]) continue;
          let object: Object3D;
          if (jsonData[key].object){
            object = jsonData[key].object.clone();
            object.traverse((node: any) => {
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
            // 物理世界に適応させる
            this.octree.importThreeObj3D(key, object, key);
            const obj: IObjectManagement = {
              id: jsonData[key].id,
              type: key,
              visibleType: "force",
              object: object,
              args: jsonData[key].args,
              physics: "along",
              layerNum: 0
            };
            this.oms.push(obj);
          }
        }
        else if (key == "objects") {
          const objs = jsonData[key];
          await Promise.all(
            Object.keys(objs).map(async (key: string) => {
              const targetObj = objs[key];
              this.oms.push(targetObj);
              // PhysicsTypeがnoneでなければ、物理世界に入れる(今後)
              const om = this.oms.find((om: IObjectManagement) => om.id == targetObj.id);
              if (om.physics !== "none"){
                if (om.physics == "aabb" && om.object instanceof Object3D){
                  const aabb = new Box3();
                  aabb.setFromObject(om.object);
                  console.log("inpirtAABB", key, aabb);
                  this.octree.importAABB(om.id, aabb, "objects");
                }
                else if (om.physics == "along" && om.object instanceof Object3D){
                  this.octree.importThreeObj3D(om.id, om.object, key);
                }
                // args.positionがあれば追加したFaceを移動させる
                if (om.args.position){
                  const pos = om.args.position;
                  const posVec = new Vector3(pos.x, pos.y, pos.z);
                  om.object.position.copy(posVec.clone());
                  this.octree.translateFaceByName(om.id, posVec.clone());
                  om.layerNum = this.getLayerNumber(pos);
                }
                if (om.args.rotation){
                  const rot = om.args.rotation;
                  om.object.rotation.copy(rot.clone());
                }
              }
            })
          )
        }
        else if (key == "threes"){
          Object.keys(jsonData[key]).map((_key: string) => {
            const targetObj = jsonData[key][_key];
            const obj: IObjectManagement = targetObj;
            this.oms.push(obj);
            const om = this.oms.find((om: IObjectManagement) => om.id == targetObj.id);
            if (om.args.type){
              if (om.args.type == "box"){}
              else if (om.args.type == "sphere"){}
              else if (om.args.type == "cylinder"){}
              else if (om.args.type == "plane"){}
              else if (om.args.type == "text"){}
              if (om.physics !== "none"){
                if (om.physics == "aabb" && om.object instanceof Object3D){
                  const aabb = new Box3();
                  aabb.setFromObject(om.object);
                  this.octree.importAABB(om.id, aabb, key);
                }
                else if (om.physics == "along" && om.object instanceof Object3D){
                  this.octree.importThreeObj3D(om.id, om.object, key);
                }
                // args.positionがあれば追加したFaceを移動させる
                if (om.args.position){
                  const pos = om.args.position;
                  const posVec = new Vector3(pos.x, pos.y, pos.z);
                  this.octree.translateFaceByName(om.id, posVec.clone());
                  om.layerNum = this.getLayerNumber(pos);
                }
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
          });
        }
        else if (key == "sky") {
          if (!jsonData[key]) continue;
          const obj: IObjectManagement = {
            id: jsonData[key].id,
            name: jsonData[key].name,
            type: key,
            args: jsonData[key],
            visibleType: "force",
            physics: jsonData[key].physics
          }
          this.oms.push(obj);
        }
        else if (key == "lights") {
          const objs = jsonData[key];
          Object.keys(objs).map((key: string) => {
            const targetObj = objs[key];
            const obj: IObjectManagement = targetObj;
            this.oms.push(obj);
          })
        }
        else if (key == "uis") {
          // this.ui = jsonData[key];
          // UI描画は調整中
        }
      }

    })();
    console.log("--- 全設定ファイルの読み込み完了 ---");
    this.nowLoading = false;
    this.loadCompleted = true;
    return true;
  }

  /**
   * ロード状況を更新する
   */
  loadingFileState = async(key: string, updateSize: number) => {
    if (nowLoadedFiles) {
      nowLoadedFiles[key] = updateSize;
      // 最後に集計してPercentageを更新する
      let totalSize = 0;
      Object.keys(nowLoadedFiles).map((key) => {
        totalSize += nowLoadedFiles[key];
      })
      loadPer = 100 * Number((totalSize / totalFileSize).toFixed(2));
    }
  }

  /**
   * WebWorkerのメッセージを処理する
   */
  handleWorkerMessage = (e: MessageEvent) => {
    const { type, data } = e.data;
    if (type == "getOM") {
      // OMを取得する
      const { id } = data;
      this.worker.postMessage({ type: "getOM", data: this.getOMById(id) })
    }
    else if (type == "setPosition"){
      // 特定のIDのOMの位置を変更する
      const { id, position } = data;
      const om = this.getOMById(id);
      if (om) {
        om.object.position.set(position.x, position.y, position.z);
      }
    }
    else if (type == "getPosition") {
      // 特定のIDのOMの位置を取得する
      const { id } = data;
      const om = this.getOMById(id);
      if (om) {
        this.worker.postMessage({ type: "getPosition", data: om.object.position })
      }
    }
    else if (type == "setRotation"){
      // 特定のIDのOMの回転を変更する
      const { id, rotation } = data;
      const om = this.getOMById(id);
      if (om) {
        om.object.rotation.set(rotation.x, rotation.y, rotation.z);
      }
    }
    else if (type == "getRotation") {
      // 特定のIDのOMの回転を取得する
      const { id } = data;
      const om = this.getOMById(id);
      if (om) {
        this.worker.postMessage({ type: "getRotation", data: om.object.rotation })
      }
    }
    else if (type == "setScale"){
      // 特定のIDのOMのスケールを変更する
      const { id, scale } = data;
      const om = this.getOMById(id);
      if (om) {
        om.object.scale.set(scale.x, scale.y, scale.z);
      }
    }
    else if (type == "getScale") {
      // 特定のIDのOMのスケールを取得する
      const { id } = data;
      const om = this.getOMById(id);
      if (om) {
        this.worker.postMessage({ type: "getScale", data: om.object.scale })
      }
    }
    else if (type == "setQuaternion"){
      // 特定のIDのOMの回転を変更する
      const { id, quaternion } = data;
      const om = this.getOMById(id);
      if (om) {
        om.object.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      }
    }
    else if (type == "setAvatar"){
      // アバターをセットする
      const { threeMesh } = data;
      this.setAvatar(threeMesh);
    }
    else if (type == "setAvatarPosition"){
      // アバターの位置をセットする
      const { position } = data;
      const avatarObject = this.getAvatarObject();
      if (avatarObject) {
        avatarObject.object.position.set(position.x, position.y, position.z);
        // 物理世界の位置も更新する
        this.world.sphere.center.set(position.x, position.y, position.z);
      }
    }
    else if (type == "changeAvatarOffset"){
      // アバターのカメラオフセットを変更する
      const { offset } = data;
      this.avatar.cameraOffset = offset.clone();
    }
    else if (type == "changeUniforms"){
      // 特定のIDのOMのuniformsを変更する
      const { id, uniforms } = data;
      const om = this.getOMById(id);
      if (om) {
        if (om.object instanceof Mesh && om.object.material) {
          Object.keys(uniforms).map((key) => {
            if (om.object instanceof Mesh){
              om.object.material.uniforms[key].value = uniforms[key];
            }
          });
          om.object.material.needsUpdate = true;
        }
      }
    }
    else if (type == "changeVisible"){
      // 特定のIDのOMのvisibleを変更する
      const { id, visible } = data;
      const om = this.getOMById(id);
      if (om) {
        om.object.visible = visible;
      }
    }
    else if (type == "changeVisibleType"){
      // 特定のIDのOMのvisibleTypeを変更する
      const { id, visibleType } = data;
      const om = this.getOMById(id);
      if (om) {
        om.visibleType = visibleType;
      }
    }
    else if (type == "changeAnimation"){
      // 特定のIDのOMのanimationを変更する
      const { id, animation } = data;
      const om = this.getOMById(id);
      if (om) {
        if (om.object instanceof SkinnedMesh) {
          om.mixer.stopAllAction();
          om.mixer.clipAction(animation).play();
        }
      }
    }
    else if (type == "startAnimationByName"){
      // 特定のIDのOMのanimationを開始する
      const { id, animationName } = data;
      const om = this.getOMById(id);
      if (om) {
        if (om.object instanceof SkinnedMesh) {
          const animation = om.animations.find(animation => animation.name == animationName);
          if (animation) {
            om.mixer.stopAllAction();
            om.mixer.clipAction(animation).play();
          }
        }
      }
    }
    else if (type == "stopAnimationByName"){
      // 特定のIDのOMのanimationを停止する
      const { id, animationName } = data;
      const om = this.getOMById(id);
      if (om) {
        if (om.object instanceof SkinnedMesh) {
          const animation = om.animations.find(animation => animation.name == animationName);
          if (animation) {
            om.mixer.stopAllAction();
          }
        }
      }
    }
    else if (type == "startSound"){
      // 特定のIDのサウンドを開始する
      const { id } = data;
      const sound = this.getSoundById(id);
      if (sound) {
        sound.sound.play();
      }
    }
    else if (type == "loopSound"){
      // 特定のIDのサウンドをループする
      const { id } = data;
      const sound = this.getSoundById(id);
      if (sound) {
        sound.sound.setLoop(true);
        sound.sound.play();
      }
    }
    else if (type == "stopSound"){
      // 特定のIDのサウンドを停止する
      const { id } = data;
      const sound = this.getSoundById(id);
      if (sound) {
        sound.sound.stop();
      }
    }
    else if (type == "setSoundVolume"){
      // 特定のIDのサウンドの音量を変更する
      const { id, volume } = data;
      const sound = this.getSoundById(id);
      if (sound) {
        sound.sound.setVolume(volume);
      }
    }
  }

  /**
   * 特定のIDのOMを取得する
   * @param id 
   * @returns 
   */
  getOMById(id: string): IObjectManagement {
    return this.oms.find(om => om.id == id);
  }

  /**
   * 特定のIDのサウンドを取得する
   */
  getSoundById(id: string): ISoundProps {
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
  getAvatarObject(): IObjectManagement {
    return this.oms.find(om => om.type == "avatar");
  }

  /**
   * アバターをセットする
   */
  setAvatar(threeMesh: Mesh|Object3D) {
    const avatarObject = this.getAvatarObject();
    if (avatarObject) {
      if (avatarObject.args.position) {
        threeMesh.position.set(
          avatarObject.args.position.x,
          avatarObject.args.position.y,
          avatarObject.args.position.z
        );   
      }
      if (avatarObject.args.rotation) {
        threeMesh.quaternion.copy(
          new Quaternion().setFromEuler(new Euler(
            0,
            MathUtils.degToRad(avatarObject.args.rotation.y),
            0
          ))
        );
      }
      this.avatar = new AvatarController(
        this,
        threeMesh,
        avatarObject.args.height / 2,
        avatarObject.animations,
        avatarObject.mixer,
        avatarObject.args.animMapper,
        avatarObject.args.sounds
      );
      // 物理世界に対応させる
      this.world.addAvatar(this.avatar);
      if (this.camera) {
        this.avatar.setCamera(this.camera);
      }
    }
  }

  /**
   * アバター用カメラをセットする
   * @param camera 
   */
  setAvatarCamera(camera: PerspectiveCamera | OrthographicCamera) {
    this.camera = camera;
    if (this.avatar) {
      this.avatar.setCamera(this.camera);
    }
    // Listenerをセットする
    this.camera.add(this.listener);
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
   * 通常オブジェクトを取得する
   */
  getStaticObjects(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "object");
  }

  /**
   * 光源データを取得する
   */
  getLights(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "light");
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
  ) {
    const layerXLen = worldSize / layerGrid;
    const layerZLen = worldSize / layerGrid;
    const cx = worldSize / 2;
    const cz = worldSize / 2;
    if (cx < Math.abs(pos.x)) return null; // ワールド範囲外X方向
    if (cz < Math.abs(pos.z)) return null; // ワールド範囲外Z方向
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
    const avatar = this.getAvatarObject();
    if (avatar && this.avatar) {
      const id = avatar.id;
      const nowposition = this.avatar.object.position.clone();
      this.updateLayerNumber(id, nowposition);
    }
  }

  /**
   * 全てのオブジェクトを取得する
   */
  getAllObjects(): Object3D[] {
    const objects = this.oms.filter(om => om.object);
    return objects.map(obj => obj.object);
  }

  /**
   * 可視上のオブジェクトを全て取得する
   */
  getAllvisibleObjects(): Object3D[] {
    const objects = this.oms.filter(om => {
      let isVisible = false;
      if (om.object && om.visibleType == "force") return true;
      if (om.object && om.visibleType == "auto") {
        if (om.layerNum !== undefined) {
          return true;
        }
      }
      return isVisible;
    });
    return objects.map(obj => obj.object);
  }

  /**
   * 可視上オブジェクトの更新
   */
  updateViewableObject() {
    if (this.camera) {
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
          this.camera.layers.enable(layerNum);
        });
        const disableLayers = this.possibleLayers.filter(layerNum => !visibleLayers.includes(layerNum));
        // みえない範囲を非表示にする
        disableLayers.map((layerNum) => {
            this.camera.layers.disable(layerNum);
        });
        this.cameraLayer = nowCameraLayer;
        this.camera.layers.enable(0);
      }
    }
  }

  /**
   * フレームによる更新
   * @param timeDelta 
   * @param input 
   */
  frameUpdate(timeDelta: number, input: IInputMovement) {
    if (this.loadCompleted) {
      // アバターのレイヤー番号を更新する
      this.updateAvatarLayerNumber();
      // 可視上のオブジェクトを更新する
      this.updateViewableObject();
      // 物理ワールドを更新する
      if (this.world) this.world.step(timeDelta, input);
      // 動態管理をリフレッシュする
      this.moveOrderKeys = [];
    }
  }

}

export const NinjaEngineContext = createContext<NinjaEngine>(null);