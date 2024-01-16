import { detectAABBCapsuleCollision } from "../../../lib/utils/IntersectsDetector";
import { Mesh, BoxGeometry, Vector3, Euler, CapsuleGeometry } from "three";

/**
 * AABBCapsuleDetector Overlap
 * @description 同じ位置にあるAABB/Capsuleは衝突しているか
 */
it("Intersect AABBCapsule Overlap", () => {
  const box = new Mesh(new BoxGeometry(1, 1, 1));
  box.position.copy(new Vector3(0, 0, 0));
  const capsule = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule.position.copy(new Vector3(0, 0, 0));
  expect(detectAABBCapsuleCollision(box, capsule).intersect).toBe(true);
});

/**
 * BoxCapsuleDetector Not Overlap
 * @description 重なっていないBox/Capsuleは衝突していないか
 */
it("Intersect BoxCapsule Not Overlap", () => {
  const box = new Mesh(new BoxGeometry(1, 1, 1));
  box.rotation.copy(new Euler(0, 0, 0));
  box.position.copy(new Vector3(0, 0, 0));
  const capsule = new Mesh(new CapsuleGeometry(1, 1, 1, 6));
  capsule.rotation.copy(new Euler(0, 0, 0));
  capsule.position.copy(new Vector3(2, 0, 0));
  expect(detectAABBCapsuleCollision(box, capsule).intersect).toBe(false);
});