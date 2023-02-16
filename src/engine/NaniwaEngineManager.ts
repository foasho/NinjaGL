import { World } from "./World";
import { Octree } from "./Octree";
import { } from "./NaniwaLoaders";
import { IInputMovement, IObjectManagement } from "./NaniwaProps";
import { AvatarController } from "./AvatarController";
import { createContext } from "react";
import { convertToGB } from "@/commons/functional";
import { Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";

export interface INaniwaEngineProps {
    worldSize?: [number, number, number];
    jsonPath ? : string;
}

const storageDir = "/assets";
export class NaniwaEngine {
    deviceType: "mobile" | "tablet" | "desktop" = "mobile";
    useGPU    : boolean = false;
    worldSize : [number, number, number] = [64, 64, 64];
    memory    : { totalHeap: number, usedHeap: number, availableHeap: number } = {
        totalHeap     : 0,
        usedHeap      : 0,
        availableHeap : 0
    }
    nowLoading  : boolean = false;
    totalFileSize    : number = 0;
    loadPer     : number = 0;
    loadingText : string = "ファイルサイズを取得中...";
    oms : IObjectManagement[] = [];

    world  : World;
    octree : Octree;
    avatar : AvatarController;

    constructor(props?: INaniwaEngineProps){
        this.detectDevice();
        this.detectGPU();
        this.updateAvailableMemory();
        const L = this.getOctreeL();
        if (props && props.worldSize) this.worldSize = props.worldSize;
        let jsonPath = "savedata/default.json";
        this.importConfigJson(jsonPath);
        this.world = new World();
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
        const maxL = 8;
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
        const res = await reqApi({route: path});
        console.log(res.data);
        if (res.data){
            Object.keys(res.data).map(async (key: string) => {
                if (key == "avatar" || key == "terrain"){
                    const obj: IObjectManagement = {
                        type: key,
                        filePath: res.data[key].filePath,
                        args: res.data[key].args
                    }
                    const size = await this.getFileSize(obj.filePath);
                    console.log("DEBUG size", size);
                    this.oms.push(obj);
                }
                else if (key == "objects"){
                    const objs = res.data[key];
                    Object.keys(objs).map((key: string) => {
                        const obj: IObjectManagement = {
                            type: "object",
                            args: res.data[key].args
                        }
                        this.oms.push(obj);
                    });
                }
            });

            (async () => {

            })()
        }
        this.nowLoading = false;
    }

    /**
     * ファイルサイズを取得する
     */
    async getFileSize(path: string): Promise<number>{
        return new Promise((resolve) => {
            fetch(storageDir+path)
            .then(response => {
                const contentLength = response.headers.get('content-length');
                console.log("CHECK, ", contentLength);
                return resolve(Number(contentLength));
            });
        })
    }
}

export const NaniwaEngineContext = createContext<NaniwaEngine>(null);