import {
  IConfigParams,
  IObjectManagement,
  IScriptManagement,
  ITextureManagement,
  IUIManagement,
  kvsProps,
} from "./NinjaProps";
import { saveAs } from "file-saver";
import {
  Euler,
  Vector3,
  Object3D,
  Mesh,
  Scene,
  LoadingManager,
  Quaternion,
} from "three";
import {
  GLTFLoader,
  SkeletonUtils,
  DRACOLoader,
  KTX2Loader,
  GLTFExporter,
  GLTFExporterOptions,
} from "three-stdlib";
import JSZip from "jszip";
import { MeshoptDecoder } from "meshoptimizer";
import { InitMobileConfipParams } from "./NinjaInit";
// import {
//   GLTFExporter,
//   GLTFExporterOptions,
// } from "three-stdlib";

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.157.0`;
export const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
  `${THREE_PATH}/examples/jsm/libs/draco/gltf/`
);
export const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
  `${THREE_PATH}/examples/jsm/libs/basis/`
);
export const gltfLoader = new GLTFLoader()
  .setCrossOrigin("anonymous")
  .setDRACOLoader(DRACO_LOADER)
  .setMeshoptDecoder(MeshoptDecoder);

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
  kvs: kvsProps;
  constructor() {
    this.oms = [];
    this.ums = [];
    this.tms = [];
    this.sms = [];
    this.config = InitMobileConfipParams;
    this.kvs = {};
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
  setKVS(kvs: kvsProps): void {
    this.kvs = kvs;
  }
  addOM(om: IObjectManagement): void {
    this.oms.push(om);
  }
  addUM(um: IUIManagement): void {
    this.ums.push(um);
  }
  addTM(tm: ITextureManagement): void {
    this.tms.push(tm);
  }
  addSM(sm: IScriptManagement): void {
    this.sms.push(sm);
  }
  addKV(key: string, value: any): void {
    this.kvs[key] = value;
  }
}

/**
 * NJC出力ファイルを生成してダウンロード保存
 */
export const saveNJCFile = async (njcFile: NJCFile, fileName: string) => {
  // ZIPファイルを生成
  const zipData = await saveNJCBlob(njcFile);
  // ZIPファイルを保存
  saveAs(zipData, fileName);
  return zipData;
};

/**
 * NJC出力ファイルをBlob変換
 */
export const saveNJCBlob = async (njcFile: NJCFile): Promise<Blob> => {
  const zip = new JSZip();

  // assetsディレクトリを作成
  const objectsDir = zip.folder("assets");

  // GLBモデルをobjectsディレクトリに追加
  const exportOMs: IObjectManagement[] = [];
  for (const _om of njcFile.oms) {
    const om = { ..._om }; // 元のデータを変更しないようにコピー
    if (om.args.url && objectsDir) {
      // Object / Avatar / LandScapeの場合はGLBモデルを生成
      if (
        om.type === "object" ||
        om.type === "avatar" ||
        om.type === "landscape"
      ) {
        let clone: Object3D;
        const scene = await loadGLTF(om.args.url);
        clone = SkeletonUtils.clone(scene);
        const glbData = await exportGLTF(clone);
        objectsDir.file(`${om.id}.glb`, glbData);
        om.filePath = `assets/${om.id}.glb`;
      }
      // audioの場合はファイルを追加
      if (om.type === "audio") {
        const audioFile = await fetch(om.args.url);
        const blob = await audioFile.blob();
        // 拡張子は合わせる
        const ext = om.args.url.split(".").pop();
        objectsDir.file(`${om.id}.${ext}`, blob);
        om.args.url = `assets/${om.id}.${ext}`;
      }
      // videoの場合はファイルを追加
      if (om.type === "video") {
        const videoFile = await fetch(om.args.url);
        const blob = await videoFile.blob();
        // 拡張子は合わせる
        const ext = om.args.url.split(".").pop();
        objectsDir.file(`${om.id}.${ext}`, blob);
        om.filePath = `assets/${om.id}.${ext}`;
      }
    }
    exportOMs.push(om);
  }

  // JSONファイルを追加
  zip.file("config.json", JSON.stringify(njcFile.config));
  zip.file("ums.json", JSON.stringify(njcFile.ums));
  zip.file("tms.json", JSON.stringify(njcFile.tms));
  // zip.file('addons.json', JSON.stringify({})); // Addonは未対応
  zip.file("sms.json", JSON.stringify(njcFile.sms));
  zip.file("oms.json", JSON.stringify(exportOMs));

  // ZIPファイルを生成
  const zipData = await zip.generateAsync({ type: "blob" });
  return zipData;
};

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
    throw new Error("ZIPファイルの読み込みに失敗しました");
  }

  // JSONファイルを抽出
  const configJson = JSON.parse(
    await loadedZip.file("config.json")!.async("text")
  );
  const umsJson = JSON.parse(await loadedZip.file("ums.json")!.async("text"));
  const tmsJson = JSON.parse(await loadedZip.file("tms.json")!.async("text"));
  const smsJson = JSON.parse(await loadedZip.file("sms.json")!.async("text"));
  const omsJson = JSON.parse(await loadedZip.file("oms.json")!.async("text"));

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
  const objectsDir = loadedZip.folder("assets");
  if (objectsDir) {
    for (const om of omsJson) {
      const glbFile = objectsDir.file(`${om.id}.glb`);
      if (glbFile) {
        // om.args.urlにGLBモデルのURLを設定
        om.args.url = URL.createObjectURL(await glbFile.async("blob"));
      }
      // Position,Rotation,Scale同期
      if (om.args && om.args.position) {
        om.args.position = new Vector3(
          om.args.position.x,
          om.args.position.y,
          om.args.position.z
        );
      }
      if (om.args && om.args.rotation) {
        om.args.rotation = new Euler(
          om.args.rotation._x,
          om.args.rotation._y,
          om.args.rotation._z,
          om.args.rotation._order
        );
      }
      if (om.args && om.args.scale) {
        om.args.scale = new Vector3(
          om.args.scale.x,
          om.args.scale.y,
          om.args.scale.z
        );
      }
      if (om.args && om.args.quaternion) {
        om.args.quaternion = new Quaternion(
          om.args.quaternion._x,
          om.args.quaternion._y,
          om.args.quaternion._z,
          om.args.quaternion._w
        );
      }
      if (om.args && om.args.cameraDirection) {
        om.args.cameraDirection = new Vector3(
          om.args.cameraDirection.x,
          om.args.cameraDirection.y,
          om.args.cameraDirection.z
        );
      }
      if (om.args && om.args.offset) {
        om.args.offset = new Vector3(
          om.args.offset.x,
          om.args.offset.y,
          om.args.offset.z
        );
      }
      if (om.args && om.args.offsetParams) {
        if (om.args.offsetParams.tp) {
          om.args.offsetParams.tp.offset = new Vector3().copy(
            om.args.offsetParams.tp.offset
          );
          om.args.offsetParams.tp.lookAt = new Vector3().copy(
            om.args.offsetParams.tp.lookAt
          );
        }
        if (om.args.offsetParams.fp) {
          om.args.offsetParams.fp.offset = new Vector3().copy(
            om.args.offsetParams.fp.offset
          );
          om.args.offsetParams.fp.lookAt = new Vector3().copy(
            om.args.offsetParams.fp.lookAt
          );
        }
      }
      njcFile.addOM(om);
    }
  }

  return njcFile;
};

const fetchZipAsBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
};

const convertBlobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};

/**
 * NJCファイルPathから読み込む
 * @param file Path
 * @returns
 */
export const loadNJCFileFromURL = async (
  url: string,
  onProgress?: (itemsLoaded: number, itemsTotal: number) => void
): Promise<NJCFile> => {
  const blob = await fetchZipAsBlob(url);
  console.log(blob);
  // blobはZipファイルなのでFileに変換
  const file = convertBlobToFile(blob, "njc.zip");
  console.log(file);
  return await loadNJCFile(file, onProgress);
};

async function loadGLTFFromData(
  data: ArrayBuffer,
  onProgress?: (itemsLoaded: number, itemsTotal: number) => void,
  totalSize?: number
): Promise<Object3D> {
  return new Promise<Object3D>((resolve, reject) => {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    gltfLoader.load(
      url,
      (gltf) => {
        const scene = gltf.scene || (gltf.scenes[0] as Object3D);
        scene.animations = gltf.animations; // アニメーションをセット
        resolve(scene);
        URL.revokeObjectURL(url);
      },
      (progress) => {
        if (onProgress) {
          console.log("progressing...");
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

export const loadGLTF = async (url: string): Promise<Object3D> => {
  return new Promise<Object3D>((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const scene = gltf.scene || (gltf.scenes[0] as Object3D);
        scene.animations = gltf.animations; // アニメーションをセット
        resolve(scene);
      },
      (progress) => {
        // console.log("progressing...");
      },
      (error) => {
        console.error("EXCEPTION: loadGLTF");
        reject(error);
      }
    );
  });
};

export const exportGLTF = async (
  scene: Scene | Object3D
): Promise<ArrayBuffer> => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const exporter = new GLTFExporter();

    const options: GLTFExporterOptions = {
      binary: true,
      animations: scene.animations,
      includeCustomExtensions: true,
      maxTextureSize: 4096,
    };

    exporter.parse(
      scene,
      (gltfData) => {
        if (gltfData instanceof ArrayBuffer) {
          resolve(gltfData);
        } else {
          reject(new Error("GLTFExporter returned a non-binary result."));
        }
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
};

/**
 * SceneをArrayBufferに変更
 * @param scene
 * @returns
 */
export const convertObjectToArrayBuffer = async (
  scene: Scene
): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    var exporter = new GLTFExporter();
    const options: GLTFExporterOptions = {
      binary: true,
      animations: scene.animations,
      includeCustomExtensions: true,
      // maxTextureSize: 4096
    };
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          return result;
        } else {
          const output = JSON.stringify(result, null, 2);
          return saveString(output);
        }
      },
      (error) => {
        console.log("error");
        console.log(error);
      },
      options
    );
  });
};

/**
 * 特定のObjectをBlobに変換する
 */
export const convertObjectToBlob = async (object: Object3D): Promise<Blob> => {
  return new Promise((resolve) => {
    var exporter = new GLTFExporter();
    const options: GLTFExporterOptions = {
      binary: true,
      animations: object.animations,
      includeCustomExtensions: true,
      maxTextureSize: 4096,
    };

    // ユーザーデータは事前につけるため削除
    // if (userData){
    //   object.userData = userData;
    // }

    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) {
          return resolve(saveArrayBuffer(result));
        } else {
          const output = JSON.stringify(result, null, 2);
          return resolve(saveString(output));
        }
      },
      (error) => {
        console.log("error");
        console.log(error);
      },
      options
    );
  });
};

const saveString = (text: string): Blob => {
  return new Blob([text], { type: "text/plain" });
};
const saveArrayBuffer = (buffer: ArrayBuffer): Blob => {
  return new Blob([buffer], { type: "application/octet-stream" });
};

/**
 * 特定のObjectをFileに変換する
 */
export const convertObjectToFile = (
  object: Object3D,
  fileName = "model.glb"
): Promise<File> => {
  return new Promise((resolve) => {
    var exporter = new GLTFExporter();
    const options: GLTFExporterOptions = {
      binary: true,
      animations: object.animations,
      includeCustomExtensions: true,
      maxTextureSize: 4096,
    };

    // if (userData) {
    //   object.userData = userData;
    // }

    exporter.parse(
      object,
      (result) => {
        let blob: Blob;
        let mimeType: string;

        if (result instanceof ArrayBuffer) {
          blob = new Blob([result], { type: "application/octet-stream" });
          mimeType = "application/octet-stream";
          fileName += ".glb";
        } else {
          const output = JSON.stringify(result, null, 2);
          blob = new Blob([output], { type: "application/json" });
          mimeType = "application/json";
          fileName += ".gltf";
        }

        const file = new File([blob], fileName, { type: mimeType });
        return resolve(file);
      },
      (error) => {
        console.error("Error exporting scene:" + fileName);
        console.error(error);
      },
      options
    );
  });
};
