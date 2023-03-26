import {
  Box3,
  Mesh,
  BufferGeometry,
  Sphere,
  Object3D,
  GLBufferAttribute
} from "three";

/**
 * ベース: https://github.com/yomotsu/meshwalk
 */
import { Vector3 } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { isInstersectSphereBox, isIntersectTriAABB } from "./Intersects";

/**
 * 親Octreeのサイズと段階数の深さ
 */
export interface IOctree {
  min: Vector3;
  max: Vector3;
  maxDepth: number;
}

/**
 * 理論：http://marupeke296.com/COL_3D_No15_Octree.html
 */
export class Octree extends Box3 {
  // 作成時変数
  min: Vector3;
  max: Vector3;
  maxDepth: number;
  // クラス内変数/関数
  nodes: Array<Array<OctreeNode>>;
  isOctree = true;
  nodeBoxSize = new Vector3();
  nodeBoxMin = new Vector3();
  nodeBoxMax = new Vector3();

  /**
   * ---------------------------------------
   * 拡張変数 Extend THREE.Box3
   * ---------------------------------------
   */

  constructor(props: IOctree) {
    super(); // Box3として拡張

    this.min = props.min;
    this.max = props.max;
    this.maxDepth = props.maxDepth;
    this.nodes = [];
    this.isOctree = true;

    for (var depth = 0; depth < this.maxDepth; depth++) {
      this.nodes.push([]);
      var pow2 = Math.pow(2, depth);
      var pow4 = Math.pow(4, depth);
      this.nodeBoxSize.subVectors(this.max, this.min).divideScalar(pow2);
      for (var i = 0, length = Math.pow(8, depth); i < length; i++) {
        var indexX = i % pow2;
        var indexY = i / pow4 | 0;
        var indexZ = (i / pow2 | 0) % pow2;
        this.nodeBoxMin.set(this.min.x + indexX * this.nodeBoxSize.x, this.min.y + indexY * this.nodeBoxSize.y, this.min.z + indexZ * this.nodeBoxSize.z);
        this.nodeBoxMax.copy(this.nodeBoxMin).add(this.nodeBoxSize);
        var mortonNumber = getMortonNumber(indexX, indexY, indexZ);
        this.nodes[depth][mortonNumber] = new OctreeNode({ tree: this, depth: depth, mortonNumber: mortonNumber, max: this.nodeBoxMax, min: this.nodeBoxMin });
      }
    }
  }

  /**
   * ---------------------------------------
   * 拡張関数 Extend
   * ---------------------------------------
   */
  /**
   * 物理世界へMeshデータを取り込む
   * @param threeMesh 
   */
  importThreeMesh(name: string, threeMesh: Mesh) {
    threeMesh.updateMatrix();
    var geometory = threeMesh.geometry;
    geometory.applyMatrix4(threeMesh.matrix);
    geometory.computeVertexNormals();
    if (geometory instanceof BufferGeometry) {
      this.importGeometories(name, [geometory]);
    }
  }

  /**
   * ジオメトリをImportする
   * @param name 
   * @param geometries 
   */
  importGeometories(name: string, geometries: BufferGeometry[]) {
    geometries.map((geometry) => {
      var geometryId = geometry.uuid;
      if (geometry.index) {
        var indices = geometry.index.array;
        if (geometry.attributes.position instanceof GLBufferAttribute) return;
        var positions = geometry.attributes.position.array;
        var groups = geometry.groups.length !== 0 ? geometry.groups : [
          {
            start: 0,
            count: indices.length,
            materialIndex: 0
          }
        ];
        for (var i = 0, l = groups.length; i < l; ++i) {
          var start = groups[i].start;
          var count = groups[i].count;
          for (var ii = start, ll = start + count; ii < ll; ii += 3) {
            var a = indices[ii];
            var b = indices[ii + 1];
            var c = indices[ii + 2];
            var vA = new Vector3().fromArray(positions, a * 3);
            var vB = new Vector3().fromArray(positions, b * 3);
            var vC = new Vector3().fromArray(positions, c * 3);

            // make face normal
            var cb = new Vector3().subVectors(vC, vB);
            var ab = new Vector3().subVectors(vA, vB);
            var faceNormal = cb.cross(ab).normalize().clone();
            var face = new Face({ a: vA, b: vB, c: vC, normal: faceNormal, meshID: geometryId, name: name });
            this.addFace(face);
          }
        }
      }
      else {
        console.log("Geometryエラー");
        console.log(geometry);
      }
    });
  }

  /**
   * GLTFを物理世界に取り入れる
   * @param name 
   * @param threeGLTF 
   * @returns 
   */
  importThreeGLTF(name: string, threeGLTF: GLTF) {
    const geometries = [];
    threeGLTF.scene.traverse((node: Mesh) => {
      if (node.isMesh) {
        if (node.geometry) {
          const _node = node.clone();
          _node.updateMatrix();
          const geometry = _node.geometry.clone();
          geometry.applyMatrix4(_node.matrixWorld);
          geometry.computeVertexNormals();
          geometries.push(geometry);
        }
      }
    });
    this.importGeometories(name, geometries);
    return geometries;
  }

  /**
   * Object3Dを物理世界に取り入れる
   * @param name 
   * @param threeObject
   * @returns 
   */
  importThreeObj3D(name: string, threeObject: Object3D) {
    const geometries = [];
    threeObject.traverse((node: Mesh) => {
      if (node.isMesh) {
        if (node.geometry) {
          const _node = node.clone();
          _node.updateMatrix();
          const geometry = _node.geometry.clone();
          geometry.applyMatrix4(_node.matrixWorld);
          geometry.computeVertexNormals();
          geometries.push(geometry);
        }
      }
    });
    console.log(geometries);
    this.importGeometories(name, geometries);
    return geometries;
  }


  /**
   * 3角形を追加する
   * @param face 
   */
  addFace(face: Face) {
    var tmp = [];
    var targetNodes = this.nodes[0].slice(0);
    for (var i = 0, l = this.maxDepth; i < l; i++) {
      for (var ii = 0, ll = targetNodes.length; ii < ll; ii++) {
        var node = targetNodes[ii];
        var isIntersected = isIntersectTriAABB(face.a, face.b, face.c, node);
        if (isIntersected) {
          node.trianglePool.push(face);
          if (i + 1 !== this.maxDepth) {
            tmp = tmp.concat(node.getChildNodes());
          }
        }
      }
      if (tmp.length === 0) {
        break;
      }
      targetNodes = tmp.slice(0);
      tmp.length = 0;
    }
  }



  /**
   * メッシュの削除
   * @param meshId 
   */
  removeThreeMesh(meshId: string) {
    this.nodes.forEach((nodeDepth) => {
      nodeDepth.forEach((node) => {
        var newTrianglePool = [];
        node.trianglePool.forEach((face) => {
          if (face.meshID !== meshId) {
            newTrianglePool.push(face);
          }
        });
        node.trianglePool = newTrianglePool;
      });
    });
  }

  /**
   * 名前からメッシュの削除
   * @param name 
   */
  removeThreeMeshByName(name: string) {
    this.nodes.forEach((nodeDepth: OctreeNode[]) => {
      nodeDepth.forEach((node: OctreeNode) => {
        var newTrianglePool = [];
        node.trianglePool.forEach((face) => {
          if (face.name !== name) {
            newTrianglePool.push(face);
          }
        });
        node.trianglePool = newTrianglePool;
      });
    });
  }

  /**
   * 名前からメッシュの位置を更新する
   */
  updateThreeMeshByName(name: string) {
    // 追って記述する
  }

  /**
   * 衝突していたNodeを取得
   * @param sphere 
   * @param depth 
   * @returns 
   */
  getIntersectedNodes(sphere: Sphere, depth: number) {
    var tmp = [];
    var intersectedNodes = [];
    var isIntersected = isInstersectSphereBox(sphere, this);
    if (!isIntersected) return [];
    var targetNodes = this.nodes[0].slice(0);
    for (var i = 0, l = depth; i < l; i++) {
      for (var ii = 0, ll = targetNodes.length; ii < ll; ii++) {
        var node = targetNodes[ii];
        var _isIntersected = isInstersectSphereBox(sphere, node);
        if (_isIntersected) {
          var isAtMaxDepth = i + 1 === depth;
          if (isAtMaxDepth) {
            if (node.trianglePool.length !== 0) {
              intersectedNodes.push(node);
            }
          } else {
            tmp = tmp.concat(node.getChildNodes());
          }
        }
      }
      targetNodes = tmp.slice(0);
      tmp.length = 0;
    }
    return intersectedNodes;
  }

  existFaces(name: string) {
    let isFind = false;
    this.nodes.forEach((nodeDepth: OctreeNode[]) => {
      nodeDepth.forEach((node: OctreeNode) => {
        var newTrianglePool = [];
        node.trianglePool.forEach((face) => {
          if (face.name !== name) {
            isFind = true;
          }
        });
        node.trianglePool = newTrianglePool;
      });
    });
  }

}

/**
 * 3Bit移動変換
 * @param n 
 * @returns 
 */
const separate3Bit = (n) => {
  n = (n | n << 8) & 0x0000f00f;
  n = (n | n << 4) & 0x000c30c3;
  n = (n | n << 2) & 0x00249249;
  return n;

};

/**
* モートン順番を取得
*/
const getMortonNumber = (x: number, y: number, z: number) => {
  return separate3Bit(x) | separate3Bit(y) << 1 | separate3Bit(z) << 2;
}

/**
 * ユニークな三角形からノードを生成
 */
export const uniqTrianglesFromNodes = (nodes: OctreeNode[]) => {
  const uniq = [];
  let isContained = false;
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return nodes[0].trianglePool.slice(0);
  for (let i = 0, l = nodes.length; i < l; i++) {
    for (let ii = 0, ll = nodes[i].trianglePool.length; ii < ll; ii++) {
      for (let iii = 0, lll = uniq.length; iii < lll; iii++) {
        if (nodes[i].trianglePool[ii] === uniq[iii]) {
          isContained = true;
        }
      }
      if (!isContained) {
        uniq.push(nodes[i].trianglePool[ii]);
      }
      isContained = false;
    }
  }
  return uniq;
};


/**
 * [ Octree Node ]
 * Octree傘下にあるTreeNode
 * <Box3の拡張としてクラス定義>
 */
export class IOctreeNodeProps {
  tree: Octree;
  depth: number;
  mortonNumber: number;
  min: Vector3;
  max: Vector3;
}
export class OctreeNode extends Box3 {
  /**
   * 型指定(初期値)
   */
  tree: Octree;
  depth: number = 5;
  mortonNumber: number;
  min: Vector3;
  max: Vector3;
  trianglePool = [];

  constructor(props: IOctreeNodeProps) {
    super();
    this.tree = props.tree;
    this.depth = props.depth;
    this.mortonNumber = props.mortonNumber;
    this.min = new Vector3(props.min.x, props.min.y, props.min.z);
    this.max = new Vector3(props.max.x, props.max.y, props.max.z);
    this.trianglePool = [];
  }

  getParentNode() {
    if (this.depth === 0) {
      return null
    }
    // this.tree;
    // this.tree.nodes = this.tree.nodes[ this.depth ][ this.mortonNumber >> 3 ];
    return null;
  }

  getChildNodes(): any[] {
    if (this.tree.maxDepth === this.depth) {
      return null;
    }
    var firstChild = this.mortonNumber << 3;
    return [
      this.tree.nodes[this.depth + 1][firstChild],
      this.tree.nodes[this.depth + 1][firstChild + 1],
      this.tree.nodes[this.depth + 1][firstChild + 2],
      this.tree.nodes[this.depth + 1][firstChild + 3],
      this.tree.nodes[this.depth + 1][firstChild + 4],
      this.tree.nodes[this.depth + 1][firstChild + 5],
      this.tree.nodes[this.depth + 1][firstChild + 6],
      this.tree.nodes[this.depth + 1][firstChild + 7]
    ];
  }
}


/**
 * [ 三角形表面データ ]
 */
interface IFaceProps {
  name: string;
  a: Vector3;
  b: Vector3;
  c: Vector3;
  normal: Vector3;
  meshID: string;
}
export class Face {
  isMove: boolean;// 動くものかどうか
  name: string; // Face名
  a: Vector3;
  b: Vector3;
  c: Vector3;
  normal: Vector3;
  meshID: string;
  constructor(props: IFaceProps) {
    this.name = props.name;
    this.a = props.a.clone();
    this.b = props.b.clone();
    this.c = props.c.clone();
    this.normal = props.normal.clone();
    this.meshID = props.meshID;
  }
}