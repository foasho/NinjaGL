// detectSphereSphereCollision
import { detectSphereSphereCollision } from "../../../lib/utils/IntersectsDetector";
import { Mesh, Vector3, Euler, SphereGeometry } from "three";

/**
 * SphereSphereDetector Overlap
 * @description 同じ位置にあるBox同士は衝突しているか
 */
it("Intersect SphereSphere Overlap", () => {
  const sphere1 = new Mesh(new SphereGeometry(1, 1, 1));
  sphere1.position.copy(new Vector3(0, 0, 0));
  const sphere2 = new Mesh(new SphereGeometry(1, 1, 1));
  sphere2.position.copy(new Vector3(0, 0, 0));
  expect(detectSphereSphereCollision(sphere1, sphere2).intersect).toBe(true);
});

/**
 * SphereSphereDetector Not Overlap
 * @description 重なっていないBox同士は衝突していないか
 */
it("Intersect SphereSphere Not Overlap", () => {
  const sphere1 = new Mesh(new SphereGeometry(1, 32, 32));
  sphere1.position.copy(new Vector3(0, 0, 0));
  const sphere2 = new Mesh(new SphereGeometry(1, 32, 32));
  sphere2.position.copy(new Vector3(2.1, 0, 0));
  expect(detectSphereSphereCollision(sphere1, sphere2).intersect).toBe(false);
});

/**
 * SphereSphereDetector Parts Overlap With Rotation
 * @description 回転しているBox同士は一部重なっているか
 */
it("Intersect SphereSphere Parts Overlap With Rotation", () => {
  const sphere1 = new Mesh(new SphereGeometry(1, 32, 32));
  sphere1.rotation.copy(new Euler(Math.PI/4, Math.PI/4, Math.PI/4));
  sphere1.position.copy(new Vector3(0, 0, 0));
  const sphere2 = new Mesh(new SphereGeometry(1, 32, 32));
  sphere2.rotation.copy(new Euler(Math.PI/4, 0, Math.PI/4));
  sphere2.position.copy(new Vector3(0, 1.25, 0));
  expect(detectSphereSphereCollision(sphere1, sphere2).intersect).toBe(true);
});

/**
 * SphereSphereDetector Parts Overlap With Rotation & Scale
 * @description すべてのTransformが適用されたBox同士は一部重なっているか
 */
it("Intersect SphereSphere Parts Overlap With Rotation & Scale", () => {
  const sphere1 = new Mesh(new SphereGeometry(1, 1, 1));
  sphere1.rotation.copy(new Euler(Math.PI/4, Math.PI/4, Math.PI/4));
  sphere1.position.copy(new Vector3(0, 0.5, 0));
  const sphere2 = new Mesh(new SphereGeometry(1, 1, 1));
  sphere2.rotation.copy(new Euler(Math.PI/4, 0, Math.PI/4));
  sphere2.position.copy(new Vector3(1, 1.75, 0));
  sphere2.scale.copy(new Vector3(2, 2, 1));
  expect(detectSphereSphereCollision(sphere1, sphere2).intersect).toBe(true);
});


