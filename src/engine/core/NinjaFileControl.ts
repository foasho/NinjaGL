import { NinjaEditorManager } from "@/components/NinjaEditor/NinjaEditorManager";
import { GLTFExporter, GLTFExporterOptions } from "three/examples/jsm/exporters/GLTFExporter";
import { IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from "./NinjaProps";
import { saveAs } from "file-saver";
import { Euler, Vector3, Object3D, Mesh, Scene } from "three";
import { clone as SkeletonClone } from "three/examples/jsm/utils/SkeletonUtils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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
  oms: IObjectManagement[];
  ums: IUIManagement[];
  tms: ITextureManagement[];
  scs: IScriptManagement[];
  constructor() {
    this.oms = [];
    this.ums = [];
    this.tms = [];
    this.scs = [];
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
      const clone = SkeletonClone(om.object);
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
    console.log("check", om);
    const glbFile = objectsDir.file(`${om.id}.glb`);
    if (glbFile) {
      console.log(glbFile);
      const glbData = await glbFile.async('arraybuffer');
      const object = await loadGLTFFromData(glbData);
      om.object = object;
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
      maxTextureSize: 4096,
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
      (err) => {},
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
      maxTextureSize: 4096,
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
      (error: ErrorEvent) => {
        console.log(`出力中エラー: ${error.toString()}`);
      }
      , options);
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
      maxTextureSize: 4096,
      animations: object.animations,
      includeCustomExtensions: true
    };
    console.log("UserData set");
    console.log(userData);

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
      (error: ErrorEvent) => {
        console.log(`出力中エラー: ${error.toString()}`);
      }
      , options);
  });
}

const saveString = (text: string): Blob => {
  return new Blob([text], { type: 'text/plain' });
}
const saveArrayBuffer = (buffer: ArrayBuffer): Blob => {
  return new Blob([buffer], { type: "application/octet-stream" });
}