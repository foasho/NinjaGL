/**
 * 参考：SAT法による衝突判定
 * https://discussions.unity.com/t/calculate-collision-between-2-rotated-boxes-without-using-boxcollider-math/246630/3
 */
import { Vector3, Matrix4, Box3, Mesh, Raycaster } from "three";
import { getInitCollision, ResultCollisionProps } from "./Common";

// キャッシュ用の変数
const tempVertices = [
  new Vector3(-0.5, -0.5, -0.5),
  new Vector3(0.5, -0.5, -0.5),
  new Vector3(-0.5, 0.5, -0.5),
  new Vector3(0.5, 0.5, -0.5),
  new Vector3(-0.5, -0.5, 0.5),
  new Vector3(0.5, -0.5, 0.5),
  new Vector3(-0.5, 0.5, 0.5),
  new Vector3(0.5, 0.5, 0.5),
];
const b1 = new Box3();
const b2 = new Box3();
const av11 = new Vector3(1, 0, 0);
const av12 = new Vector3(0, 1, 0);
const av13 = new Vector3(0, 0, 1);
const av21 = new Vector3(1, 0, 0);
const av22 = new Vector3(0, 1, 0);
const av23 = new Vector3(0, 0, 1);
const ray = new Raycaster();
ray.firstHitOnly = true;
let castDirection = new Vector3();

const projectBoxOnAxis = (
  box: Mesh,
  axis: Vector3,
  matrix: Matrix4
): {
  min: number;
  max: number;
} => {
  const vertices = tempVertices.map((vertex) => vertex.clone());
  let min = Infinity;
  let max = -Infinity;

  vertices.forEach((vertex) => {
    vertex.applyMatrix4(matrix);
    const projection = vertex.dot(axis);
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  });

  return { min, max };
};

const isSeparatedOnAxis = (
  axis: Vector3,
  box1: Mesh,
  box2: Mesh,
  matrix1: Matrix4,
  matrix2: Matrix4
) => {
  const worldAxis = axis.clone().normalize();

  const projection1 = projectBoxOnAxis(box1, worldAxis, matrix1);
  const projection2 = projectBoxOnAxis(box2, worldAxis, matrix2);

  return projection1.max < projection2.min || projection2.max < projection1.min;
};

export const detectBoxBoxCollision = (
  boxMesh1: Mesh,
  boxMesh2: Mesh
): ResultCollisionProps => {
  const res = getInitCollision();
  let intersect = false;
  // 回転率が微小な場合は、AABBで判定
  if (
    Math.abs(boxMesh1.rotation.x) < 0.1 &&
    Math.abs(boxMesh1.rotation.y) < 0.1 &&
    Math.abs(boxMesh1.rotation.z) < 0.1 &&
    Math.abs(boxMesh2.rotation.x) < 0.1 &&
    Math.abs(boxMesh2.rotation.y) < 0.1 &&
    Math.abs(boxMesh2.rotation.z) < 0.1
  ) {
    const box1 = b1.setFromObject(boxMesh1);
    const box2 = b2.setFromObject(boxMesh2);
    if (box1.intersectsBox(box2)) {
      intersect = true;
    }
  }
  if (!intersect) {
    let satIntersect = true;
    boxMesh1.updateMatrixWorld();
    boxMesh2.updateMatrixWorld();
    const matrix1 = boxMesh1.matrixWorld;
    const matrix2 = boxMesh2.matrixWorld;

    const axes1 = [
      av11.clone().applyMatrix4(matrix1).normalize(),
      av12.clone().applyMatrix4(matrix1).normalize(),
      av13.clone().applyMatrix4(matrix1).normalize(),
    ];
    const axes2 = [
      av21.clone().applyMatrix4(matrix2).normalize(),
      av22.clone().applyMatrix4(matrix2).normalize(),
      av23.clone().applyMatrix4(matrix2).normalize(),
    ];

    // ボックス1とボックス2の各軸に対する分離軸チェック
    for (let i = 0; i < 3; i++) {
      if (isSeparatedOnAxis(axes1[i], boxMesh1, boxMesh2, matrix1, matrix2)) {
        satIntersect = false;
        break;
      }
      if (isSeparatedOnAxis(axes2[i], boxMesh1, boxMesh2, matrix1, matrix2)) {
        satIntersect = false;
        break;
      }
    }
    if (satIntersect) {
      // クロスプロダクトによる分離軸のチェック
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const crossAxis = axes1[i].clone().cross(axes2[j]);
          if (
            crossAxis.lengthSq() > 1e-10 &&
            isSeparatedOnAxis(crossAxis, boxMesh1, boxMesh2, matrix1, matrix2)
          ) {
            satIntersect = false;
            break;
          }
        }
      }
    }
    intersect = satIntersect;
  }

  // 衝突点の計算
  if (intersect) {
    /**
     * 計算量を減らすために、単純化する
     * @衝突点は、box1の中心から、box2の中心へRaycastして、box1の面との衝突点を求める
     */
    castDirection = new Vector3()
      .subVectors(boxMesh1.position, boxMesh2.position)
      .normalize();
    ray.set(boxMesh2.position, castDirection);
    const intersects = ray.intersectObject(boxMesh1, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      res.distance = intersects[0].distance;
      res.point.copy(point);
      res.castDirection.copy(castDirection);
      res.recieveDirection.copy(castDirection.clone().negate());
    }
  }
  res.intersect = intersect;

  // すべての軸において分離が見つからなかった場合、衝突している
  return res;
};
