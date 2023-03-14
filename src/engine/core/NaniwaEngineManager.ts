import { World } from "./World";
import { Octree } from "./Octree";
import { AutoGltfLoader, AvatarLoader, TerrainLoader } from "./NaniwaLoaders";
import { IInputMovement, IObjectManagement, ISetSoundOption, ISoundProps, IUpdateSoundOption } from "./NaniwaProps";
import { AvatarController } from "./AvatarController";
import { createContext } from "react";
import { convertToGB } from "@/commons/functional";
import { AnimationClip, AnimationMixer, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Vector3, Audio, AudioListener, AudioLoader, LoopOnce, MathUtils, Quaternion, Euler } from "three";
import { reqApi } from "@/services/ServciceApi";
import { useInputControl } from "./InputControls";
import { NaniwaShader } from "./NaniwaShader";

export interface INaniwaEngineProps {
  worldSize?: [number, number, number];
  jsonPath?: string;
  layerGrid?: number;

}

let nowLoadedFiles: { [key: string]: number } = { "sample": 0 };
export let totalFileSize: number = 1;
export let loadPer: number = 0;
export let loadingText: string = "ファイルサイズを取得中...";

export class NaniwaEngine {
  jsonPath: string = null;
  layerGrid: number = 8;
  layerLength: number = 3;
  possibleLayers: number[] = [];
  nowLoading: boolean = false;
  loadCompleted: boolean = false;
  deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  useGPU: boolean = false;
  worldSize: [number, number, number] = [128, 128, 128];
  memory: { totalHeap: number, usedHeap: number, availableHeap: number } = {
    totalHeap: 0,
    usedHeap: 0,
    availableHeap: 0
  }
  oms: IObjectManagement[] = [];
  world: World;
  octree: Octree;
  avatar: AvatarController;
  camera: PerspectiveCamera | OrthographicCamera;
  backmusics: ISoundProps[] = [];
  shader: NaniwaShader = new NaniwaShader();
  viewableKeys: string[] = []; // 可視化管理
  moveOrderKeys: string[] = []; // 動態管理
  ui: any = null; // UIリスト

  constructor() { }

  /**
   * セットアップ
   */
  allSetup(props?: INaniwaEngineProps) {
    this.detectDevice();
    this.detectGPU();
    this.updateAvailableMemory();
    if (props && props.worldSize) this.worldSize = props.worldSize;
    this.world = new World();
    const L = this.getOctreeL();
    this.octree = new Octree({
      min: new Vector3(
        -this.worldSize[0] / 2,
        -this.worldSize[1] / 2,
        -this.worldSize[2] / 2
      ),
      max: new Vector3(
        this.worldSize[0] / 2,
        this.worldSize[1] / 2,
        this.worldSize[2] / 2
      ),
      maxDepth: L
    });
    this.world.addOctree(this.octree);
    this.possibleLayers = [...Array((this.layerGrid * this.layerGrid))].map((_, idx) => { return idx + 1 });
  }

  /**
   * すべての情報をクリアにする
   */
  allClear() {
    this.nowLoading = false;
    this.loadCompleted = false;
    this.useGPU = false;
    this.world = null;
    this.octree = null;
    this.oms = [];
    this.avatar = null;
    this.camera = null;
    this.removeSoundAll();
    this.backmusics = [];
  }

  /**
   * 設定JSONファイルをセットする
   */
  setJson(jsonPath: string) {
    this.jsonPath = jsonPath;
  }

  /**
   * 接続しているデバイス種別を検出
   */
  detectDevice() {
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
  detectGPU() {
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
  updateAvailableMemory() {
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
  getOctreeL(): number {
    const maxL = 7;
    let n = 0;
    let l = this.worldSize[0];
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
  async loadJson(path: string): Promise<any> {
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
  async importConfigJson() {
    if (this.loadCompleted || this.nowLoading) return null;
    const path = this.jsonPath ? this.jsonPath : "savedata/default.json";
    this.nowLoading = true;
    totalFileSize = 1;
    nowLoadedFiles = {};
    const jsonData = await this.loadJson(path);
    const keys = Object.keys(jsonData);
    await (async () => {
      for await (const key of keys) {
        if (key == "init") {
          if (jsonData[key]["backmusics"]) {
            const objs = jsonData[key]["backmusics"];
            objs.map((obj) => {
              this.setSound(obj);
            })
          }
        }
        else if (key == "avatar" || key == "terrain") {
          let object: Object3D;
          let animations: AnimationClip[] = [];
          let mixer: AnimationMixer = null;
          if (key == "avatar") {
            const { gltf } = await AvatarLoader(
              {
                filePath: `${jsonData[key].filePath}`,
                height: jsonData[key].args.height,
                isCenter: jsonData.avatar.args.isCenter ? jsonData.avatar.args.isCenter : false,
                onLoadCallback: this.loadingFileState
              }
            );
            object = gltf.scene;
            animations = gltf.animations;
            mixer = new AnimationMixer(gltf.scene);
          }
          else if (key == "terrain") {
            const { gltf } = await TerrainLoader(
              {
                filePath: `${jsonData[key].filePath}`,
                posType: "center",
                mapSize: jsonData[key].args.mapSize,
                onLoadCallback: this.loadingFileState
              }
            );
            // const { gltf, simModObj } = await AutoGltfLoader(
            //     {
            //         filePath: `${res.data[key].filePath}`,
            //         onLoadCallback: this.loadingFileState
            //     }
            // );
            object = gltf.scene;
            // 物理世界に適応させる
            this.octree.importThreeGLTF(key, gltf);
            // this.octree.importThreeObj3D(key, simModObj);
          }
          const obj: IObjectManagement = {
            type: key,
            visiableType: "force",
            object: object,
            args: jsonData[key].args,
            mixer: mixer,
            animations: animations
          }
          this.oms.push(obj);
        }
        else if (key == "objects") {
          const objs = jsonData[key];
          await Promise.all(
            Object.keys(objs).map(async (key: string) => {
              const obj: IObjectManagement = {
                type: "object",
                args: jsonData[key].args,
                visiableType: "auto"
              }
              this.oms.push(obj);
            })
          )
        }
        else if (key == "sky") {
          const obj: IObjectManagement = {
            type: key,
            args: jsonData[key],
            visiableType: "force"
          }
          this.oms.push(obj);
        }
        else if (key == "lights") {
          const objs = jsonData[key];
          objs.map((_obj) => {
            const obj: IObjectManagement = {
              type: "light",
              args: _obj,
              visiableType: "force"
            }
            this.oms.push(obj);
          })
        }
        else if (key == "scripts") { }
        else if (key == "shaderFiles") {
          const fileNames = jsonData[key];
          await this.shader.load(fileNames);
        }
        else if (key == "ui") {
          this.ui = jsonData[key];
        }
      }

    })()
    console.log("--- 全設定ファイルの読み込み完了 ---");
    this.nowLoading = false;
    this.loadCompleted = true;
  }

  /**
   * ロード状況を更新する
   */
  loadingFileState(key: string, updateSize: number) {
    if (nowLoadedFiles) {
      nowLoadedFiles[key] = updateSize;
      // 最後に集計してPercentageを更新する
      let totalSize = 0;
      Object.keys(nowLoadedFiles).map((key) => {
        totalSize += nowLoadedFiles[key];
      })
      loadPer = 100 * Number((totalSize / totalFileSize).toFixed(2));
      console.log("全体のロード%の確認: ", loadPer);
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
  setAvatar(threeMesh: Mesh) {
    const avatarObject = this.getAvatarObject();
    if (avatarObject) {
      if (avatarObject.args.initPosition) {
        threeMesh.position.set(
          avatarObject.args.initPosition[0],
          avatarObject.args.initPosition[1],
          avatarObject.args.initPosition[2]
        );
      }
      if (avatarObject.args.initRotateDegY) {
        threeMesh.quaternion.copy(
          new Quaternion().setFromEuler(new Euler(
            0,
            MathUtils.degToRad(avatarObject.args.initRotateDegY),
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
   * 光源データを取得する
   */
  getLights(): IObjectManagement[] {
    return this.oms.filter(om => om.type == "light");
  }

  /**
 * サウンドをセットする
 */
  setSound(params: ISetSoundOption) {
    if (!this.backmusics.find(s => s.key == params.key)) {
      const listener = new AudioListener();
      const sound = new Audio(listener);
      const audioLoader = new AudioLoader();
      audioLoader.load(
        params.filePath,
        (buffer) => {
          sound.setBuffer(buffer);
          sound.setLoop(params.loop);
          sound.setVolume(params.volume);
          sound.play();
        }
      )
      this.backmusics.push({
        key: params.key,
        sound: sound,
        loop: params.loop,
        filePath: params.filePath,
        volume: params.volume,
        trigAnim: params.trigAnim,
        stopAnim: params.stopAnim
      })
    }
  }

  /**
   * サウンドを更新
   */
  updateSound(params: IUpdateSoundOption) {
    const sound = this.backmusics.find(s => s.key == params.key);
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
    const sound = this.backmusics.find(s => s.key == key);
    if (sound && !sound.sound.isPlaying) {
      sound.sound.play();
    }
  }

  /**
   * 特定のサウンドを止める
   */
  stopSound(key: string) {
    const sound = this.backmusics.find(s => s.key == key);
    if (sound) {
      sound.sound.pause();
    }
  }

  /**
 * すべてのサウンドを止める
 */
  removeSoundAll() {
    this.backmusics.map((sound) => {
      sound.sound.pause();
      sound.sound.remove();
    });
  }

  /**
   * 現在のレイヤーから可視する周辺のレイヤー番号を取得する
   */
  getActiveLayers(layerNum: number) {
    const l = this.layerLength; // 監視グリッドエリア範囲
    const g = this.layerGrid;   // グリッド数
    const n = layerNum;        // 現在レイヤー

    const r = n % g;// 現在レイヤーの列番号
    const c = Math.ceil(n / g);// 現在レイヤーの行番号
    const layers = [n];

    [...Array(l)].map((_, idx) => {
      const i = idx + 1;
      // 中心
      layers.push((c - 1 - i) * g + r);
      layers.push((c - 1 + i) * g + r);
      layers.push((c - 1) * g + (r - i));
      layers.push((c - 1) * g + (r + i));

      // 周辺
      [...Array(l - i)].map((_none, _idx) => {
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
  getLayerNumber(pos: Vector3) {
    const layerXLen = this.worldSize[0] / this.layerGrid;
    const layerZLen = this.worldSize[1] / this.layerGrid;
    const cx = this.worldSize[0] / 2;
    const cz = this.worldSize[1] / 2;
    if (cx < Math.abs(pos.x)) return null; // ワールド範囲外X方向
    if (cz < Math.abs(pos.z)) return null; // ワールド範囲外Z方向
    const px = pos.x + cx;
    const pz = pos.z + cz;
    const r = Math.ceil(px / layerXLen);
    const c = Math.ceil((this.worldSize[1] - pz) / layerZLen);
    const layer = (c - 1) * this.layerGrid + r;
    return layer;
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
  getAllVisiableObjects(): Object3D[] {
    const objects = this.oms.filter(om => {
      let isVisible = false;
      if (om.object && om.visiableType == "force") return true;
      if (om.object && om.visiableType == "auto") {
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
      const nowLayerNum = this.getLayerNumber(this.camera.position);
      const visibleLayers = this.getActiveLayers(nowLayerNum);
      visibleLayers.map((layerNum) => {
        // this.camera.layers.enable(layerNum);
      });
      const disableLayers = this.possibleLayers;
      disableLayers.map((layerNum) => {
        // this.camera.layers.disable(layerNum);
      });
    }
  }

  /**
   * 動作オブジェクトの更新
   */


  /**
   * フレームによる更新
   * @param timeDelta 
   * @param input 
   */
  frameUpdate(timeDelta: number, input: IInputMovement) {
    if (this.loadCompleted) {
      this.updateViewableObject();
      if (this.world) this.world.step(timeDelta, input);
      // 動態管理をリフレッシュする
      this.moveOrderKeys = [];
    }
  }

}

export const NaniwaEngineContext = createContext<NaniwaEngine>(null);