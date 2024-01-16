import { Box3, Line3, Mesh, Vector3 } from "three";
import { getInitCollision, ResultCollisionProps } from "./Common";

// 再利用可能な変数
const v1 = new Vector3();
const b1 = new Box3();
const b2 = new Box3();
const l1 = new Line3();

export type CapsuleInfoProps = {
  segment: Line3;
  radius: number;
};

/**
 * BoxとCapsuleの衝突判定
 * @param boxMesh
 * @param capsuleMesh
 * @returns
 */
export const detectAABBCapsuleCollision = (
  boxMesh: Mesh,
  capsuleMesh: Mesh
): ResultCollisionProps => {
  // AABBを取得
  const box = b1.setFromObject(boxMesh);
  // TODO: 純粋な方向ベクトルから、衝突判定のBoxの拡縮をするべき
  // Boxのローカル座標系に変換するためのマトリクスを取得
  const capsule = b2.setFromObject(capsuleMesh);

  const res = getInitCollision();

  const intersect = box.intersectsBox(capsule);
  if (intersect) {
    // Boxの中心
    const boxCenter = box.getCenter(v1);

    // 各軸に沿った重なりの中心点を計算
    const centerOverlapX =
      (Math.min(box.max.x, capsule.max.x) +
        Math.max(box.min.x, capsule.min.x)) /
      2;
    const centerOverlapY =
      (Math.min(box.max.y, capsule.max.y) +
        Math.max(box.min.y, capsule.min.y)) /
      2;
    const centerOverlapZ =
      (Math.min(box.max.z, capsule.max.z) +
        Math.max(box.min.z, capsule.min.z)) /
      2;

    // Boxの中心から見た重なりの中心点の方向を計算
    let direction = v1.set(
      centerOverlapX - boxCenter.x,
      centerOverlapY - boxCenter.y,
      centerOverlapZ - boxCenter.z
    );
    const originDirection = direction.clone().normalize();

    // 方向ベクトルを正規化して、最も大きい成分を基に方向を決定
    direction.normalize();
    const maxComponent = Math.max(
      Math.abs(direction.x),
      Math.abs(direction.y),
      Math.abs(direction.z)
    );

    if (maxComponent === Math.abs(direction.x)) {
      direction.set(direction.x > 0 ? 1 : -1, 0, 0);
    } else if (maxComponent === Math.abs(direction.y)) {
      direction.set(0, direction.y > 0 ? 1 : -1, 0);
    } else {
      direction.set(0, 0, direction.z > 0 ? 1 : -1);
    }

    // capsule側はそのまま、box側は逆方向にする
    const capsuleDirection = direction.clone().negate();

    const rounededPoint = boxMesh.position.clone().add(originDirection);
    // Boxの境界に合わせた衝突点を計算
    let point = new Vector3();
    if (direction.x !== 0) {
      // X軸に沿った衝突の場合
      point.x = direction.x > 0 ? box.max.x : box.min.x;
      point.y = Math.min(Math.max(rounededPoint.y, box.min.y), box.max.y);
      point.z = Math.min(Math.max(rounededPoint.z, box.min.z), box.max.z);
      res.distance = Math.abs(capsuleMesh.position.x - point.x);
    } else if (direction.y !== 0) {
      // Y軸に沿った衝突の場合
      point.x = Math.min(Math.max(rounededPoint.x, box.min.x), box.max.x);
      point.y = direction.y > 0 ? box.max.y : box.min.y;
      point.z = Math.min(Math.max(rounededPoint.z, box.min.z), box.max.z);
      res.distance = Math.abs(capsuleMesh.position.y - point.y);
    } else {
      // Z軸に沿った衝突の場合
      point.x = Math.min(Math.max(rounededPoint.x, box.min.x), box.max.x);
      point.y = Math.min(Math.max(rounededPoint.y, box.min.y), box.max.y);
      point.z = direction.z > 0 ? box.max.z : box.min.z;
      res.distance = Math.abs(capsuleMesh.position.z - point.z);
    }

    res.point.copy(point);
    res.castDirection.copy(direction);
    res.recieveDirection.copy(capsuleDirection);
    res.intersect = intersect;
    // res.distance = capsuleMesh.position.distanceTo(point);
  }
  return res;
};
