/**
 * 参考: http://marupeke296.com/COL_3D_No27_CapsuleCapsule.html
 */
import { detectCapsuleCapsuleCollision } from "../../../lib/utils/IntersectsDetector";
import { Mesh, BoxGeometry, Vector3, Euler, CapsuleGeometry } from "three";

/**
 * CapsuleCapsuleDetector Overlap
 * @description 同じ位置にあるCapsule/Capsuleは衝突しているか
 */
it("Intersect CapsuleCapsule Overlap", () => {
  const capsule1 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule1.position.copy(new Vector3(0, 0, 0));
  const capsule2 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule2.position.copy(new Vector3(0, 0, 0));
  expect(detectCapsuleCapsuleCollision(capsule1, capsule2).intersect).toBe(
    true
  );
});

/**
 * CapsuleCapsuleDetector Not Overlap
 * @description 重なっていないCapsule/Capsuleは衝突していないか
 */
it("Intersect CapsuleCapsule Not Overlap", () => {
  const capsule1 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule1.rotation.copy(new Euler(0, 0, 0));
  capsule1.position.copy(new Vector3(0, 0, 0));
  const capsule2 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule2.rotation.copy(new Euler(0, 0, 0));
  capsule2.position.copy(new Vector3(2.1, 0, 0));
  expect(detectCapsuleCapsuleCollision(capsule1, capsule2).intersect).toBe(
    false
  );
});

/**
 * CapsuleCapsuleDetector Parts Overlap With Rotation
 * @description 回転しているCapsule同士は一部重なっているか
 */
it("Intersect CapsuleCapsule Parts Overlap With Rotation", () => {
  const capsule1 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule1.rotation.copy(new Euler(Math.PI / 4, Math.PI / 4, Math.PI / 4));
  capsule1.position.copy(new Vector3(0, 0, 0));
  const capsule2 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule2.rotation.copy(new Euler(Math.PI / 4, 0, Math.PI / 4));
  capsule2.position.copy(new Vector3(0, 2, 0));
  expect(detectCapsuleCapsuleCollision(capsule1, capsule2).intersect).toBe(
    true
  );
});

/**
 * CapsuleCapsuleDetector Not Overlap With Rotation
 * @description 回転しているCapsule同士は一部重なっているか
 */
it("Intersect CapsuleCapsule Not Overlap With Rotation", () => {
  const capsule1 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule1.rotation.copy(new Euler(Math.PI / 4, Math.PI / 4, Math.PI / 4));
  capsule1.position.copy(new Vector3(0, 0, 0));
  const capsule2 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule2.rotation.copy(new Euler(Math.PI / 4, 0, Math.PI / 4));
  capsule2.position.copy(new Vector3(0, 2.3, 0));
  expect(detectCapsuleCapsuleCollision(capsule1, capsule2).intersect).toBe(
    false
  );
});

/**
 * CapsuleCapsuleDetector Parts Overlap With Rotation & Scale
 * @description すべてのTransformが適用されたCapsule同士は一部重なっているか
 */
it("Intersect CapsuleCapsule Parts Overlap With Rotation & Scale", () => {
  const capsule1 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule1.rotation.copy(new Euler(Math.PI / 4, Math.PI / 4, Math.PI / 4));
  capsule1.position.copy(new Vector3(0, 0, 0));
  const capsule2 = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule2.rotation.copy(new Euler(Math.PI / 4, 0, Math.PI / 4));
  capsule2.position.copy(new Vector3(0, 2.5, 0));
  capsule2.scale.copy(new Vector3(2, 2, 1));
  expect(detectCapsuleCapsuleCollision(capsule1, capsule2).intersect).toBe(
    false
  );
});