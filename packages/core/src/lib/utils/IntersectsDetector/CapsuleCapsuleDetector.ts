/**
 * 参考: http://marupeke296.com/COL_3D_No27_CapsuleCapsule.html
 */
import { CapsuleGeometry, Line3, Mesh, Raycaster, Vector3 } from "three";
import { getInitCollision, ResultCollisionProps } from "./Common";

// 再利用可能な変数
const ray = new Raycaster();
ray.firstHitOnly = true;

// カプセルの線分を定義
const getCapsuleSegment = (capsuleMesh: Mesh): Line3 => {
  const geometry = capsuleMesh.geometry as CapsuleGeometry;
  const length = geometry.parameters.length;
  const start = new Vector3(0, length / 2, 0);
  const end = new Vector3(0, -length / 2, 0);
  capsuleMesh.updateMatrixWorld();
  start.applyMatrix4(capsuleMesh.matrixWorld);
  end.applyMatrix4(capsuleMesh.matrixWorld);

  return new Line3(start, end);
}

/**
 * Capsule同士の衝突判定
 * @description 2つの線分間の最短距離が双方の半径の合計よりも短いか否かで衝突判定を行う
 *
 * @param capsuleMesh1
 * @param capsuleMesh2
 * @returns
 */
export const detectCapsuleCapsuleCollision = (
  capsuleMesh1: Mesh,
  capsuleMesh2: Mesh
): ResultCollisionProps => {
  const res = getInitCollision();
  const segment1 = getCapsuleSegment(capsuleMesh1);
  const segment2 = getCapsuleSegment(capsuleMesh2);

  // 線分間の最短距離を計算する
  const closestSegmentsDistance = getClosestPointsBetweenLines(segment1, segment2);
  const radius1 = (capsuleMesh1.geometry as CapsuleGeometry).parameters.radius;
  const radius2 = (capsuleMesh2.geometry as CapsuleGeometry).parameters.radius;
  if (closestSegmentsDistance.distance <= radius1 + radius2) {
    res.intersect = true;
    // castDirectionは、capsule1 -> capsule2の方向
    const castDirection = closestSegmentsDistance.direction;
    // capsule1 -> capsule2のraycast
    ray.set(capsuleMesh1.position, castDirection);
    const intersects = ray.intersectObject(capsuleMesh2, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      res.distance = intersects[0].distance;
      res.point.copy(point);
      res.castDirection.copy(castDirection.normalize());
      res.recieveDirection.copy(castDirection.normalize().negate());
    }
  }

  return res;
};

/**
 * 線分間の最短距離を計算する
 * @param line1
 * @param line2
 * @returns number
 */
export const getClosestPointsBetweenLines = (
  line1: Line3,
  line2: Line3
): {
  distance: number;
  direction: Vector3;
} => {
  const p1 = line1.start;
  const p2 = line1.end;
  const p3 = line2.start;
  const p4 = line2.end;

  const d1 = p2.clone().sub(p1);
  const d2 = p4.clone().sub(p3);
  const r = p1.clone().sub(p3);

  const a = d1.dot(d1);
  const e = d2.dot(d2);
  const f = d2.dot(r);

  let s: number, t: number;
  if (a <= Number.EPSILON && e <= Number.EPSILON) {
    s = t = 0;
  } else if (a <= Number.EPSILON) {
    t = f / e;
    t = Math.max(0, Math.min(t, 1));
    s = 0;
  } else {
    const c = d1.dot(r);
    if (e <= Number.EPSILON) {
      s = 0;
      t = Math.max(0, Math.min(-c / a, 1));
    } else {
      const b = d1.dot(d2);
      const denom = a * e - b * b;
      if (denom !== 0) {
        s = Math.max(0, Math.min((b * f - c * e) / denom, 1));
      } else {
        s = 0;
      }
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = Math.max(0, Math.min(-c / a, 1));
      } else if (t > 1) {
        t = 1;
        s = Math.max(0, Math.min((b - c) / a, 1));
      }
    }
  }

  const closestPoint1 = p1.clone().add(d1.clone().multiplyScalar(s));
  const closestPoint2 = p3.clone().add(d2.clone().multiplyScalar(t));

  // direction: capsule1 -> capsule2
 return {
    distance: closestPoint1.distanceTo(closestPoint2),
    direction: closestPoint2.clone().sub(closestPoint1).normalize(),
  }
};
