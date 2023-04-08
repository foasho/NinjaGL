import { GLTFExporter, GLTFExporterOptions } from "three-stdlib/exporters/GLTFExporter";
import { IConfigParams, IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from "./NinjaProps";
import { saveAs } from "file-saver";
import { Euler, Vector3, Object3D, Mesh, Scene } from "three";
import { SkeletonUtils } from "three-stdlib/utils/SkeletonUtils";
import { GLTFLoader } from "three-stdlib/loaders/GLTFLoader";
import JSZip from 'jszip';

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
  scs: IScriptManagement[];
  constructor() {
    this.oms = [];
    this.ums = [];
    this.tms = [];
    this.scs = [];
    this.config = { physics: { octree: "auto" }, mapsize: 64 }
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
  addSC(sc: IScriptManagement):void {
    this.scs.push(sc)
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
      objectsDir.file(`${om.id}.glb`, glbData);
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
  zip.file('init.json', JSON.stringify({}));
  zip.file('uis.json', JSON.stringify({}));
  zip.file('textures.json', JSON.stringify({}));
  zip.file('addons.json', JSON.stringify({}));
  zip.file('scripts.json', JSON.stringify({}));
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
export const loadNJCFile = async (file: File): Promise<NJCFile> => {
  const zip = new JSZip();

  // ZIPファイルを読み込み
  const loadedZip = await zip.loadAsync(file);

  // JSONファイルを抽出
  const initJson = JSON.parse(await loadedZip.file('init.json').async('text'));
  const uisJson = JSON.parse(await loadedZip.file('uis.json').async('text'));
  const texturesJson = JSON.parse(await loadedZip.file('textures.json').async('text'));
  const scriptsJson = JSON.parse(await loadedZip.file('scripts.json').async('text'));
  const omsJson = JSON.parse(await loadedZip.file('oms.json').async('text'));

  // NJCFileを生成
  const njcFile = new NJCFile();

  // GLBモデルを読み込み
  const objectsDir = loadedZip.folder('objects');
  for (const om of omsJson) {
    const glbFile = objectsDir.file(`${om.id}.glb`);
    if (glbFile) {
      const glbData = await glbFile.async('arraybuffer');
      const object = await loadGLTFFromData(glbData);
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
  return njcFile;
}

async function loadGLTFFromData(data: ArrayBuffer): Promise<Object3D> {
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
      undefined,
      (error) => {
        reject(error);
        URL.revokeObjectURL(url);
      }
    );
  });
}

async function exportGLTF(scene: Scene): Promise<ArrayBuffer> {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const exporter = new GLTFExporter();

    const options: GLTFExporterOptions = {
      binary: true,
      animations: scene.animations,
      includeCustomExtensions: true,
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
      options
    );
  });
}


/**
 * SceneをArrayBufferに変更
 * @param scene 
 * @returns 
 */
export const convertObjectToArrayBuffer = async (scene): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    var exporter = new GLTFExporter();
    const options: GLTFExporterOptions = {
      binary: true,
      animations: scene.animations,
      includeCustomExtensions: true
    };
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          return result;
        }
      },
      options);
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
      includeCustomExtensions: true
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
      options);
  });
}

const saveString = (text: string): Blob => {
  return new Blob([text], { type: 'text/plain' });
}
const saveArrayBuffer = (buffer: ArrayBuffer): Blob => {
  return new Blob([buffer], { type: "application/octet-stream" });
}