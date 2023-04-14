import { IConfigParams, IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from "./NinjaProps";
import { saveAs } from "file-saver";
import { Euler, Vector3, Object3D, Mesh, Scene } from "three";
import { GLTFLoader, SkeletonUtils } from "three-stdlib";
import { GLTFExporter, GLTFExporterOptions } from "three/examples/jsm/exporters/GLTFExporter";
import JSZip from 'jszip';
import { InitMobileConfipParams } from "./NinjaInit";

/**
 * データ構成を定義
 */
interface NJCUserData {
  [key: string]: any;
}

interface NJCObjectData {
  object: Object3D | Mesh;
  userData: NJCUserData;
}

/**
 * ファイル形式
 */
export class NJCFile {
  config: IConfigParams;
  oms: IObjectManagement[];
  ums: IUIManagement[];
  tms: ITextureManagement[];
  sms: IScriptManagement[];
  constructor() {
    this.oms = [];
    this.ums = [];
    this.tms = [];
    this.sms = [];
    this.config = InitMobileConfipParams;
  }
  setConfig(config: IConfigParams): void {
    this.config = config;
  }
  setOMs(oms: IObjectManagement[]): void {
    this.oms = oms;
  }
  setUMs(ums: IUIManagement[]): void {
    this.ums = ums;
  }
  setTMs(tms: ITextureManagement[]): void {
    this.tms = tms;
  }
  setSMs(sms: IScriptManagement[]): void {
    this.sms = sms;
  }
  addOM(om: IObjectManagement): void {
    this.oms.push(om);
  }
  addUM(um: IUIManagement):void {
    this.ums.push(um)
  }
  addTM(tm: ITextureManagement):void {
    this.tms.push(tm)
  }
  addSM(sm: IScriptManagement):void {  
    this.sms.push(sm)
  }
}

/**
 * NJC出力ファイルを生成
 */
export const saveNJCFile = async (njcFile: NJCFile, fileName: string) => {
  const zip = new JSZip();

  // objectsディレクトリを作成
  const objectsDir = zip.folder('objects');

  // GLBモデルをobjectsディレクトリに追加
  const exportOMs: IObjectManagement[] = [];
  for (const om of njcFile.oms) {
    if (om.object) {
      const exportScene = new Scene();
      const clone = SkeletonUtils.clone(om.object);
      clone.animations = om.object.animations?om.object.animations: [];
      exportScene.add(clone);
      const glbData = await exportGLTF(exportScene);
      objectsDir!.file(`${om.id}.glb`, glbData);
      om.filePath = `objects/${om.id}.glb`;
    }
    delete om.object;
    delete om.mixer;
    if (om.args){
      if (om.args.position){
        // om.args.position = 
      }
    }
    exportOMs.push(om);
  }

  // JSONファイルを追加
  zip.file('config.json', JSON.stringify(njcFile.config));
  zip.file('ums.json', JSON.stringify(njcFile.ums));
  zip.file('tms.json', JSON.stringify(njcFile.tms));
  // zip.file('addons.json', JSON.stringify({})); // Addonは未対応
  zip.file('sms.json', JSON.stringify(njcFile.sms));
  zip.file('oms.json', JSON.stringify(njcFile.oms));

  // ZIPファイルを生成
  const zipData = await zip.generateAsync({ type: 'blob' });

  // ZIPファイルを保存
  saveAs(zipData, fileName);
}

/**
 * NJCファイルを読み込む
 * @param file 
 * @returns 
 */
export const loadNJCFile = async (
  file: File,
  onProgress?: (itemsLoaded: number, itemsTotal: number) => void
): Promise<NJCFile> => {
  const totalSize = file.size;
  const zip = new JSZip();

  // ZIPファイルを読み込み
  const loadedZip = await zip.loadAsync(file);
  if (!loadedZip) {
    throw new Error('ZIPファイルの読み込みに失敗しました');
  }

  // JSONファイルを抽出
  const configJson = JSON.parse(await loadedZip.file('config.json')!.async('text'));
  const umsJson = JSON.parse(await loadedZip.file('ums.json')!.async('text'));
  const tmsJson = JSON.parse(await loadedZip.file('tms.json')!.async('text'));
  const smsJson = JSON.parse(await loadedZip.file('sms.json')!.async('text'));
  const omsJson = JSON.parse(await loadedZip.file('oms.json')!.async('text'));

  // NJCFileを生成
  const njcFile = new NJCFile();

  // 1. configを設定
  njcFile.setConfig(configJson);
  // 2. umsを設定
  njcFile.setUMs(umsJson);
  // 3. tmsを設定
  njcFile.setTMs(tmsJson);
  // 4. smsを設定
  njcFile.setSMs(smsJson);
  // 5. omとGLBモデルを読み込み
  const objectsDir = loadedZip.folder('objects');
  if (objectsDir) {
    for (const om of omsJson) {
      const glbFile = objectsDir.file(`${om.id}.glb`);
      if (glbFile) {
        const glbData = await glbFile.async('arraybuffer');
        const object = await loadGLTFFromData(
          glbData, 
          onProgress,
          totalSize
        );
        om.object = object;
      }
      // Position,Rotation,Scale同期
      if (om.args && om.args.rotation) {
        om.args.rotation = new Euler(
          om.args.rotation._x, 
          om.args.rotation._y, 
          om.args.rotation._z, 
          om.args.rotation._order
        );
      }
      if (om.args && om.args.position){
        om.args.position = new Vector3(
          om.args.position.x, 
          om.args.position.y, 
          om.args.position.z
        );
      }
      if (om.args && om.args.scale){
        om.args.scale = new Vector3(
          om.args.scale.x, 
          om.args.scale.y, 
          om.args.scale.z
        );
      }
      njcFile.addOM(om);
    }
  }

  return njcFile;
}

/**
 * NJCファイルPathから読み込む
 * @param file Path
 * @returns 
 */
export const loadNJCFileFromURL = async (
  url: string,
  onProgress?: (itemsLoaded: number, itemsTotal: number) => void
): Promise<NJCFile> => {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File(
    [blob], 
    "file.njc", 
    { type: 'application/octet-stream' }
  );
  return await loadNJCFile(file);
}

async function loadGLTFFromData(
  data: ArrayBuffer,
  onProgress?: (itemsLoaded: number, itemsTotal: number) => void,
  totalSize?: number
): Promise<Object3D> {
  return new Promise<Object3D>((resolve, reject) => {
    const loader = new GLTFLoader();
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    loader.load(
      url,
      (gltf) => {
        resolve(gltf.scene);
        URL.revokeObjectURL(url);
      },
      (progress) => {
        if (onProgress) {
          onProgress(progress.loaded, totalSize!);
        }
      },
      (error) => {
        reject(error);
        URL.revokeObjectURL(url);
      }
    );
  });
}

export const exportGLTF = async (scene: Scene): Promise<ArrayBuffer> => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const exporter = new GLTFExporter();

    const options: GLTFExporterOptions = {
      binary: true,
      animations: scene.animations,
      includeCustomExtensions: true,
      maxTextureSize: 4096
    };

    exporter.parse(
      scene,
      (gltfData) => {
        if (gltfData instanceof ArrayBuffer) {
          resolve(gltfData);
        } else {
          reject(new Error('GLTFExporter returned a non-binary result.'));
        }
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
}


/**
 * SceneをArrayBufferに変更
 * @param scene 
 * @returns 
 */
export const convertObjectToArrayBuffer = async (scene: Scene): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    var exporter = new GLTFExporter();
    const options: GLTFExporterOptions = {
      binary: true,
      animations: scene.animations,
      includeCustomExtensions: true,
      maxTextureSize: 4096
    };
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          return result;
        }
      },
      (error) => {},
      options,
      );
  });
}

/**
 * 特定のObjectをBlobに変換する
 */
export const convertObjectToBlob = async (object: Object3D, userData?: any): Promise<Blob> => {
  return new Promise((resolve) => {
    var exporter = new GLTFExporter();
    const options: GLTFExporterOptions = {
      binary: true,
      animations: object.animations,
      includeCustomExtensions: true,
      maxTextureSize: 4096
    };

    if (userData){
      object.userData = userData;
    }
    
    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) {
          return resolve(saveArrayBuffer(result));
        }
        else {
          const output = JSON.stringify(result, null, 2);
          return resolve(saveString(output));
        }
      },
      (error) => {},
      options);
  });
}

const saveString = (text: string): Blob => {
  return new Blob([text], { type: 'text/plain' });
}
const saveArrayBuffer = (buffer: ArrayBuffer): Blob => {
  return new Blob([buffer], { type: "application/octet-stream" });
}