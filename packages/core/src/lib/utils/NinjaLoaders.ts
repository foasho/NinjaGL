import {
  Mesh,
  Object3D,
  BufferGeometry,
  Material,
  DoubleSide,
  BufferAttribute,
  Box3,
  MeshStandardMaterial,
  Euler,
  Vector3,
  AnimationClip,
  Quaternion,
  MeshPhongMaterial,
  Group,
  GLBufferAttribute,
  MathUtils,
} from "three";
import { MeshoptDecoder } from "meshoptimizer";
import { GLTFLoader, GLTF } from "three-stdlib";
import { SimplifyModifier } from "three-stdlib";
import { NJCFile, loadNJCFileFromURL } from "./NinjaFileControl";

/**
 * 基本的な3Dオブジェクトのロード
 */
export interface IAutoGLTFLoaderProps {
  filePath: string; // ファイルパス
  height?: number; // 変更したい高さ
  mapSize?: number; // 変更したい幅
  simModRatio?: number; // ポリゴンの削減率(0 ~ 1) デフォルト0.5
  shadows?: boolean; // 影をつけるか
  isWireFrame?: boolean; // ワイヤーフレームにするか
  wireColor?: string; // 色
  maxIteration?: number; // 一度に削減する数
  rotation?: Euler; // 回転を加えるかどうか　デフォルト: 90 * Math.PI / 180;
  isCenter?: boolean; // 基準点を中心にするかどうか
  onLoadCallback?: (key: string, size: number) => void;
}

// 親コンポーネントに返す値
export interface IGLTFLoadData {
  gltf: GLTF;
  simModObj: Object3D;
  box?: Box3;
}

interface IIterativeModParam {
  decimationFaceCount: number; // 削減したい三角形の数
  geometry: BufferGeometry; // ジオメトリ
  updateCallback?: (geometry: BufferGeometry) => void;
}

export const AutoGltfLoader = async (
  props: IAutoGLTFLoaderProps
): Promise<IGLTFLoadData> => {
  /**
   * 初期値
   */
  var myMesh = new Mesh();
  const material = new MeshStandardMaterial({
    wireframe: true,
    color: 0xff0000,
  });
  material.flatShading = true;
  material.side = DoubleSide;
  const modifier = new SimplifyModifier();
  const MAX_FACE_COUNT_PER_ITERATION = props.maxIteration
    ? props.maxIteration
    : 2500; // １度に処理する最大削減数

  /**
   *　ベース：https://github.com/AndrewSink/3D-Low-Poly-Generator/tree/main
   * @param params
   */
  const iterativeModifier = (params: IIterativeModParam): BufferGeometry => {
    let modifierInProgress = true;
    let modifierProgressPercentage = 0;
    // 三角面数のカウント
    let startingFaceCount = params.geometry.attributes.position.count;
    // 現在の三角面数
    let currentFaceCount = startingFaceCount;
    // 変更後の三角面数
    let targetFaceCount = startingFaceCount - params.decimationFaceCount;
    let totalFacesToDecimate = startingFaceCount - targetFaceCount;
    let remainingFacesToDecimate = currentFaceCount - targetFaceCount;

    let iterationFaceCount = currentFaceCount - MAX_FACE_COUNT_PER_ITERATION;

    let simplifiedGeometry = params.geometry.clone();
    while (iterationFaceCount > targetFaceCount) {
      simplifiedGeometry = modifier.modify(
        simplifiedGeometry,
        MAX_FACE_COUNT_PER_ITERATION
      );
      if (params.updateCallback) params.updateCallback(simplifiedGeometry);
      currentFaceCount = simplifiedGeometry.attributes.position.count;
      iterationFaceCount = currentFaceCount - MAX_FACE_COUNT_PER_ITERATION;
      remainingFacesToDecimate = currentFaceCount - targetFaceCount;
      modifierProgressPercentage = Math.floor(
        ((totalFacesToDecimate - remainingFacesToDecimate) /
          totalFacesToDecimate) *
          100
      );
    }

    try {
      let tmpGeo = simplifiedGeometry.clone();
      tmpGeo = modifier.modify(tmpGeo, currentFaceCount - targetFaceCount);
      if (tmpGeo.drawRange.count === Infinity) {
        console.log(
          "(Three.js) No Next Vertex Error: \n頂点検出エラーのため飛ばします"
        );
      } else simplifiedGeometry = tmpGeo;
    } catch (e) {}

    if (params.updateCallback) params.updateCallback(simplifiedGeometry);
    modifierProgressPercentage = 100;
    modifierInProgress = false;

    return simplifiedGeometry;
  };

  /**
   * ジオメトリの統合
   * @param geometry1
   * @param geometry2
   * @returns
   */
  const mergeBufferGeometry = (
    geometry1: BufferGeometry,
    geometry2: BufferGeometry
  ): BufferGeometry | undefined => {
    // 頂点属性のオフセット
    var offset = geometry1.attributes.position.count;

    // 頂点属性を結合する
    if (geometry1.attributes.position instanceof GLBufferAttribute) return;
    if (geometry2.attributes.position instanceof GLBufferAttribute) return;
    if (geometry1.attributes.normal instanceof GLBufferAttribute) return;
    if (geometry2.attributes.normal instanceof GLBufferAttribute) return;
    if (geometry1.attributes.uv instanceof GLBufferAttribute) return;
    if (geometry2.attributes.uv instanceof GLBufferAttribute) return;
    var positions1 = geometry1.attributes.position.array;
    var positions2 = geometry2.attributes.position.array;
    var mergedPositions = new Float32Array(
      positions1.length + positions2.length
    );
    mergedPositions.set(positions1, 0);
    mergedPositions.set(positions2, positions1.length);

    // 法線を結合する
    var normals1 = geometry1.attributes.normal.array;
    var normals2 = geometry2.attributes.normal.array;
    var mergedNormals = new Float32Array(normals1.length + normals2.length);
    mergedNormals.set(normals1, 0);
    mergedNormals.set(normals2, normals1.length);

    // UVを結合する
    var uvs1 = geometry1.attributes.uv.array;
    var uvs2 = geometry2.attributes.uv.array;
    var mergedUVs = new Float32Array(uvs1.length + uvs2.length);
    mergedUVs.set(uvs1, 0);
    mergedUVs.set(uvs2, uvs1.length);

    // マージ済みの頂点属性を新しいバッファジオメトリに設定する
    var mergedGeometry = new BufferGeometry();
    mergedGeometry.setAttribute(
      "position",
      new BufferAttribute(mergedPositions, 3)
    );
    mergedGeometry.setAttribute(
      "normal",
      new BufferAttribute(mergedNormals, 3)
    );
    mergedGeometry.setAttribute("uv", new BufferAttribute(mergedUVs, 2));

    // インデックスを結合する
    var indices1 = geometry1.index?.array;
    var indices2 = geometry2.index?.array;
    if (indices1 === undefined || indices2 === undefined) return;
    var mergedIndices = new (
      indices1.length > 65535 ? Uint32Array : Uint16Array
    )(indices1.length + indices2.length);
    mergedIndices.set(indices1, 0);
    for (var i = 0; i < indices2.length; i++) {
      mergedIndices[indices1.length + i] = indices2[i] + offset;
    }

    // マージ済みのインデックスを新しいバッファジオメトリに設定する
    mergedGeometry.setIndex(new BufferAttribute(mergedIndices, 1));

    return mergedGeometry;
  };

  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(
      props.filePath,
      async (gltf: GLTF) => {
        // ジオメトリの取得処理
        let geometry: BufferGeometry | undefined;
        let mat: Material[] = [];
        const gltfCenter = new Vector3();
        gltf.scene.updateMatrixWorld();
        gltf.scene.traverse((node: Object3D | Mesh) => {
          if ((node as Mesh).isMesh && node instanceof Mesh) {
            node.updateMatrix();
            node.geometry.applyMatrix4(node.matrix);

            const mesh: Mesh = node.clone();
            if (props.isWireFrame)
              node.material = material; // 強制敵にWireFrameに変換
            else {
              // マテリアルをクローンする
              if (node.material) {
                if (node.material instanceof Material) {
                  mat.push(node.material.clone());
                } else if (node.material instanceof Array) {
                  node.material.map((m) => mat.push(m.clone()));
                }
              }
            }
            if (!geometry) {
              geometry = mesh.geometry.clone();
              geometry.uuid = MathUtils.generateUUID(); //別のUUIDとして生成
            } else {
              const _geo = mesh.geometry.clone();
              _geo.uuid = MathUtils.generateUUID();
              geometry = mergeBufferGeometry(geometry, _geo) as BufferGeometry;
            }
            node.castShadow = props.shadows ? true : false;
            node.receiveShadow = props.shadows ? true : false;

            if (props.isCenter) {
              node.geometry.computeBoundingBox();
              node.geometry.boundingBox.getCenter(gltfCenter);
            }
          }
        });
        if (geometry === undefined) return;
        const cg = geometry.clone();
        cg.computeBoundingBox();
        let bbox = cg.boundingBox;
        if (bbox === null) return;
        let baseHeight = bbox.max.y - bbox.min.y;
        let baseWidth = bbox.max.x - bbox.min.x;
        if (props.height) {
          // 高さが入力されていれば、その高さに合うようにリサイズする
          const nh = baseHeight;
          const ns = props.height / nh;
          gltf.scene.scale.multiplyScalar(ns);
          bbox = new Box3(
            bbox.min.multiplyScalar(ns),
            bbox.max.multiplyScalar(ns)
          );
          baseHeight = bbox.max.y - bbox.min.y;
        } else if (props.mapSize) {
          const nw = baseWidth;
          const ns = props.mapSize / nw;
          gltf.scene.scale.multiplyScalar(ns);
          bbox = new Box3(
            bbox.min.multiplyScalar(ns),
            bbox.max.multiplyScalar(ns)
          );
          baseWidth = bbox.max.x - bbox.min.x;
        }

        if (props.isCenter) {
          gltf.scene.updateMatrixWorld();
          gltf.scene.traverse((node) => {
            if ((node as Mesh).isMesh && node instanceof Mesh) {
              const box = new Box3().setFromObject(node.clone());
              const center = box.getCenter(new Vector3());
              node.position.sub(center);
            }
          });
        }

        // 空のMeshにセットする
        if (props.isWireFrame) {
          myMesh.material = material;
        } else {
          // 元のマテリアルデータを適応させる
          myMesh.material = mat;
          // ※ジオメトリを統合しているので、正しいマテリアルを付与できない。どうすればいいか。
        }

        myMesh.geometry = geometry;
        var tempGeometry = new Mesh();
        tempGeometry.geometry = geometry;
        geometry.computeVertexNormals();
        myMesh.geometry.center();
        if (props.rotation) {
          myMesh.rotation.copy(props.rotation);
        } else {
          myMesh.rotation.x = (90 * Math.PI) / 180;
        }
        myMesh.geometry.computeBoundingBox();
        tempGeometry.position.copy(myMesh.position);

        tempGeometry.geometry = modifier.modify(geometry, 0);
        myMesh.geometry = modifier.modify(geometry, 0);
        console.log(
          "変換前:頂点数:",
          myMesh.geometry.attributes.position.count * 6 - 12
        );
        console.log(
          "変換前:三角数:",
          (myMesh.geometry.attributes.position.count * 6 - 12) / 3
        );

        const simModRate = props.simModRatio ? props.simModRatio : 0.5;
        const count = Math.floor(
          myMesh.geometry.attributes.position.count * simModRate
        );
        console.log("削減ポリゴン数: ", count);
        const newGeometory = iterativeModifier({
          decimationFaceCount:
            myMesh.geometry.attributes.position.count * simModRate,
          geometry: myMesh.geometry,
        });
        myMesh.geometry = newGeometory;
        console.log(
          "変換後:頂点数:",
          newGeometory.attributes.position.count * 6 - 12
        );
        console.log(
          "変換後:三角数:",
          (newGeometory.attributes.position.count * 6 - 12) / 3
        );

        const conbox = new Box3().setFromObject(myMesh);
        const conHeight = conbox.max.y - conbox.min.y;
        console.log(
          "[高さ差分確認] ポリゴン削減前モデルの高さ: ",
          baseHeight,
          " ポリゴン削減後モデルの高さ：",
          conHeight
        );

        // 高さを合わせる
        myMesh.scale.multiplyScalar(baseHeight / conHeight);
        myMesh.position.y = (bbox.max.y - bbox.min.y) / 2;

        // SimpiferModifierで自動LODを実施
        let simModObj = new Object3D();
        simModObj.add(myMesh);

        console.log("正常にモデルのロードが完了しました。");

        return resolve({
          gltf: gltf,
          simModObj: simModObj,
          box: bbox,
        });
      },
      (xhr: any) => {
        // ロード率を計算してCallbackで返す　後日記述
      },
      (err: any) => {
        console.log(err);
        console.error(`3Dモデルロード中にエラーが出ました。${err.toString()}`);
        throw "[モデルロードエラー]モデルのパスや設定を確認してください。";
      }
    );
  });
};

/**
 * アバターのロード
 */
export interface IAvatarLoaderProps {
  filePath: string;
  height: number;
  isCenter?: boolean;
  isVRM?: boolean;
  onLoadCallback?: (key: string, size: number) => void;
}

export interface IAvatarData {
  gltf: GLTF;
}

export const AvatarLoader = async (
  props: IAvatarLoaderProps
): Promise<IAvatarData> => {
  const key = MathUtils.generateUUID();
  const loader = new GLTFLoader();
  return new Promise((resolve) => {
    loader.load(
      props.filePath,
      async (gltf: GLTF) => {
        if (props.isVRM) {
          gltf = gltf.userData.vrm;
        }
        // サイズを取得する
        const boundingBox = new Box3();
        let totalSize = new Vector3();
        if (props.height) {
          let idx = 0;
          gltf.scene.traverse((node: any) => {
            if (node.isMesh && idx == 0) {
              node.geometry.computeBoundingBox();
              let box = node.geometry.boundingBox;
              node.castShadow = true;
              node.receiveShadow = true;
              box.getSize(totalSize);
              boundingBox.expandByObject(node);
              idx++;
            } else if (node.isObject3D) {
              node.castShadow = true;
              node.receiveShadow = true;
              node.updateWorldMatrix(true, true);
              const boundingBox = new Box3().setFromObject(node, true);
            }
          });

          const nh = totalSize.y;
          const ns = props.height / nh;
          console.log("デフォルトサイズ: ", nh, "スケールサイズ: ", ns);
          gltf.scene.scale.set(ns, ns, ns);
        }

        if (props.isCenter) {
          const height = props.height ? props.height : totalSize.y;
          gltf.scene.position.add(new Vector3(0, -height / 2, 0));
        }

        console.log("正常にモデルのロードが完了しました。");

        return resolve({
          gltf: gltf,
        });
      },
      (xhr: any) => {
        // ロード率を計算してCallbackで返す　後日記述
        if (props.onLoadCallback) {
          props.onLoadCallback(key, xhr.loaded);
        }
      },
      (err: any) => {
        console.log(err);
        console.error(
          `アバターモデルロード中にエラーが出ました。${err.toString()}`
        );
        throw "[モデルロードエラー]モデルのパスや設定を確認してください。";
      }
    );
  });
};

export interface IAvatarDataSetterProps {
  object: Group | Object3D;
  height: number;
  isCenter?: boolean;
}
export const AvatarDataSetter = (props: IAvatarDataSetterProps) => {
  // サイズを取得する
  const boundingBox = new Box3();
  let totalSize = new Vector3();
  if (props.height) {
    let idx = 0;
    props.object.traverse((node: any) => {
      if (node.isMesh && idx == 0) {
        node.geometry.computeBoundingBox();
        let box = node.geometry.boundingBox;
        node.castShadow = true;
        node.receiveShadow = true;
        box.getSize(totalSize);
        boundingBox.expandByObject(node);
        idx++;
      } else if (node.isObject3D) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.updateWorldMatrix(true, true);
        const boundingBox = new Box3().setFromObject(node, true);
      }
    });

    const nh = totalSize.y;
    const ns = props.height / nh;
    console.log("デフォルトサイズ: ", nh, "スケールサイズ: ", ns);
    props.object.scale.set(ns, ns, ns);
  }
  if (props.isCenter) {
    const height = props.height ? props.height : totalSize.y;
    props.object.position.add(new Vector3(0, -height / 2, 0));
  }
};

/**
 * 地形データのロード
 */
export interface IGLTFLoadProps {
  filePath: string;
  // posType: "center";
  onLoadCallback?: (key: string, size: number) => void;
}

/**
 * GLTFファイルを読み込む
 * @param props
 * @returns
 */
export const LandScapeLoader = async (
  props: IGLTFLoadProps
): Promise<{ gltf: GLTF }> => {
  const key = MathUtils.generateUUID();
  return new Promise((resolve) => {
    const loader = new GLTFLoader()
      .setCrossOrigin("anonymous")
      .setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      props.filePath,
      async (gltf) => {
        const scene = gltf.scene || gltf.scenes[0];
        // scene.updateMatrixWorld();// 回転情報なども同期
        scene.traverse((node: Object3D) => {
          if (node instanceof Mesh && (node as Mesh).isMesh) {
            if (node.geometry) {
              node.updateMatrix();
              node.geometry.applyMatrix4(node.matrix);
              // --- 見た目上の回転を正として、回転率を0に戻す
              node.quaternion.copy(
                new Quaternion().setFromEuler(node.rotation)
              );
              node.rotation.set(0, 0, 0);
              // ----
              node.castShadow = true;
              node.receiveShadow = true;
            }
          }
        });

        // テスト
        // gltf.scene.rotation.set(-Math.PI/2, 0, 0);

        // サイズを取得する
        let totalSize = new Vector3();

        return resolve({ gltf: gltf });
      },
      (xhr) => {
        // ロード率を計算してCallbackで返す　後日記述
        if (props.onLoadCallback) {
          props.onLoadCallback(key, xhr.loaded);
        }
      },
      async (err) => {
        console.log("モデル読み込みエラ―");
        console.log(err);
      }
    );
  });
};

/**
 * njcPathからFileをロード
 */
export const loadNJCFileFromPath = async (path: string): Promise<NJCFile> => {
  const startTime = new Date().getTime();
  const data = await loadNJCFileFromURL(path);
  const endTime = new Date().getTime();
  console.info(`<< LoadedTime: ${endTime - startTime}ms >>`);
  return data;
};
