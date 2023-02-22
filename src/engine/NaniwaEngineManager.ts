import { World } from "./World";
import { Octree } from "./Octree";
import { AvatarLoader, TerrainLoader } from "./NaniwaLoaders";
import { IInputMovement, IObjectManagement } from "./NaniwaProps";
import { AvatarController } from "./AvatarController";
import { createContext } from "react";
import { convertToGB } from "@/commons/functional";
import { AnimationClip, AnimationMixer, Mesh, Object3D, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";

export interface INaniwaEngineProps {
    worldSize?: [number, number, number];
    jsonPath ? : string;
}

let nowLoadedFiles   : {[key: string]: number} = { "sample": 0 }; 
export let totalFileSize    : number = 1;
export let loadPer          : number = 0;
export let loadingText      : string = "ファイルサイズを取得中...";

const assetsDir = "assets";
export class NaniwaEngine {
    nowLoading       : boolean = false;
    loadCompleted    : boolean = false;
    deviceType: "mobile" | "tablet" | "desktop" = "mobile";
    useGPU    : boolean = false;
    worldSize : [number, number, number] = [64, 64, 64];
    memory    : { totalHeap: number, usedHeap: number, availableHeap: number } = {
        totalHeap     : 0,
        usedHeap      : 0,
        availableHeap : 0
    }
    oms : IObjectManagement[] = [];

    world  : World;
    octree : Octree;
    avatar : AvatarController;
    camera : PerspectiveCamera | OrthographicCamera;

    constructor(props?: INaniwaEngineProps){
        this.detectDevice();
        this.detectGPU();
        this.updateAvailableMemory();
        if (props && props.worldSize) this.worldSize = props.worldSize;
        this.world = new World();
        const L = this.getOctreeL();
        this.octree = new Octree({
            min: new Vector3(
                -this.worldSize[0]/2,
                -this.worldSize[1]/2,
                -this.worldSize[2]/2
            ), 
            max: new Vector3(
                this.worldSize[0]/2,
                this.worldSize[1]/2,
                this.worldSize[2]/2
            ), 
            maxDepth: L
        });
        this.world.addOctree(this.octree);
    }

    /**
     * 接続しているデバイス種別を検出
     */
    detectDevice(){
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
    detectGPU(){
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
    updateAvailableMemory(){
        const _performance: any = performance;
        if (_performance && _performance.memory){
            this.memory = {
                totalHeap     : _performance.memory.totalJSHeapSize,
                usedHeap      : _performance.memory.usedJSHeapSize,
                availableHeap : _performance.memory.jsHeapSizeLimit
            }
        }
    }


    /**
     * Octreeの段階数(L)を取得
     */
    getOctreeL(): number{
        const maxL = 7;
        let n = 0;
        let l = this.worldSize[0];
        for(l; l>1; l=l/2){
            n++;
        }
        const baseL = 5;
        const hpGB = convertToGB(this.memory.availableHeap);
        let L = (n - 5) + Math.round(hpGB?hpGB:1 / 2.4) + baseL;
        if (this.deviceType == "desktop"){
             if (L < maxL){
                L++;
             }
            if (L < maxL){ 
                  if (this.useGPU) L++;
             }
        }
        if (L >= maxL){
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
     * 設定JSONファイルをImportする
     */
    async importConfigJson(path: string){
        this.nowLoading = true;
        totalFileSize = 1;
        nowLoadedFiles = {};
        const res = await reqApi({route: path});
        if (res.data){
            const resSize = await reqApi(
                {route: `/api/filesize`, queryObject: { jsonPath: `${path}` } }
            );
            totalFileSize = resSize.data.size;
            const keys = Object.keys(res.data);
            await (async () => {
                for await (const key of keys) {
                    if (key == "avatar" || key == "terrain"){
                        let object: Object3D;
                        let animations: AnimationClip[] = [];
                        let mixer: AnimationMixer = null;
                        if (key == "avatar"){
                            const { gltf } = await AvatarLoader(
                                { 
                                    filePath: `${assetsDir}/${res.data[key].filePath}`,
                                    height: res.data[key].args.height,
                                    isCenter: res.data.avatar.args.isCenter? res.data.avatar.args.isCenter: false,
                                    isVRM: res.data.avatar.args.isVRM? res.data.avatar.args.isVRM: false,
                                    onLoadCallback: this.loadingFileState
                                }
                            );
                            object = gltf.scene;
                            animations = gltf.animations;
                            mixer = new AnimationMixer(gltf.scene);
                        }
                        else {
                            const { gltf } = await TerrainLoader(
                                {
                                    filePath: `${assetsDir}/${res.data[key].filePath}`,
                                    posType: "center",
                                    
                                    onLoadCallback: this.loadingFileState
                                }
                            );
                            object = gltf.scene;
                            // 物理世界に適応させる
                            this.octree.importThreeGLTF(key, gltf)
                        }
                        const obj: IObjectManagement = {
                            type       : key,
                            object     : object,
                            args       : res.data[key].args,
                            mixer      : mixer,
                            animations : animations
                        }
                        this.oms.push(obj);
                    }
                    else if (key == "objects"){
                        const objs = res.data[key];
                        await Promise.all(
                            Object.keys(objs).map(async (key: string) => {
                                const obj: IObjectManagement = {
                                    type: "object",
                                    args: res.data[key].args
                                }
                                this.oms.push(obj);
                            })
                        )
                    }
                }

            })()

        }
        console.log("CHECK");
        this.nowLoading = false;
        this.loadCompleted = true;
    }

    /**
     * ロード状況を更新する
     */
    loadingFileState(key: string, updateSize: number){
        if (nowLoadedFiles){
            nowLoadedFiles[key] = updateSize;
            // 最後に集計してPercentageを更新する
            let totalSize = 0;
            Object.keys(nowLoadedFiles).map((key) => {
                totalSize += nowLoadedFiles[key];
            })
            loadPer = 100 * Number((totalSize/totalFileSize).toFixed(2));
            console.log("全体のロード%の確認: ", loadPer);
        }
    }

    getAvatarObject(): IObjectManagement{
        return this.oms.find(om => om.type == "avatar");
    }

    /**
     * アバターをセットする
     */
    setAvatar(threeMesh: Mesh){
        const avatarObject = this.getAvatarObject();
        if (avatarObject){
            this.avatar = new AvatarController(
                threeMesh, 
                avatarObject.args.height/2,
                avatarObject.animations,
                avatarObject.mixer,
                {
                    idle: "Idle",
                    run : "Run",
                    walk: "Walk",
                    jump : "Jump",
                    action : "Punch",
                }
            );
            // 物理世界に対応させる
            this.world.addAvatar(this.avatar);
            if (this.camera){
                this.avatar.setCamera(this.camera);
            }
        }
    }

    /**
     * アバター用カメラをセットする
     * @param camera 
     */
    setAvatarCamera(camera: PerspectiveCamera | OrthographicCamera){
        this.camera = camera;
        if (this.avatar){
            this.avatar.setCamera(this.camera);
        }
    }

    /**
     * 地形データを取得する
     */
    getTerrain():IObjectManagement {
        return this.oms.find(om => om.type == "terrain");
    }

    frameUpdate(timeDelta: number, input: IInputMovement){
        if (this.world) this.world.step(timeDelta, input);
    }

}

export const NaniwaEngineContext = createContext<NaniwaEngine>(null);