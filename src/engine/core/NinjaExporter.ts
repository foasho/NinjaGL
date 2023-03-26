import { NinjaEditorManager } from "@/components/NinjaEditor/NinjaEditorManager";
import { GLTFExporter, GLTFExporterOptions } from "three/examples/jsm/exporters/GLTFExporter";
import { IObjectManagement, IUIManagement } from "./NinjaProps";
import { saveAs } from "file-saver";
import { Euler, Vector3, Object3D, Mesh, Scene } from "three";
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

// export class NJCFile {
//   objects: NJCObjectData[];
//   constructor() {
//     this.objects = [];
//   }
//   addObject(object: Object3D | Mesh, userData: NJCUserData = {}): void {
//     this.objects.push({ object, userData });
//   }
// }
export class NJCFile {
  oms: IObjectManagement[];
  uis: IUIManagement[];
  constructor() {
    this.oms = [];
    this.uis = [];
  }
  addObject(om: IObjectManagement): void {
    this.oms.push(om);
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
  for (const om of njcFile.oms) {
    if (om.object) {
      const exportScene = new Scene();
      exportScene.add(om.object);
      const glbData = await exportGLTF(exportScene);
      objectsDir.file(`${om.id}.glb`, glbData);
      om.filePath = `objects/${om.id}.glb`;
    }
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
    njcFile.addObject(om);
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
export const convertObjectToBlob = async (scene): Promise<Blob> => {
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