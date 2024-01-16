// 
import { detectBoxBoxCollision } from "../../../lib/utils/IntersectsDetector/BoxBoxDetector";
import { Mesh, BoxGeometry, Vector3, Euler } from "three";

/**
 * BoxBoxDetector Overlap
 * @description 同じ位置にあるBox同士は衝突しているか
 */
it("Intersect BoxBox Overlap", () => {
  const box1 = new Mesh(new BoxGeometry(1, 1, 1));
  box1.rotation.copy(new Euler(0, 0, 0));
  box1.position.copy(new Vector3(0, 0, 0));
  const box2 = new Mesh(new BoxGeometry(1, 1, 1));
  box2.rotation.copy(new Euler(0, 0, 0));
  box2.position.copy(new Vector3(0, 0, 0));
  expect(detectBoxBoxCollision(box1, box2).intersect).toBe(true);
});

/**
 * BoxBoxDetector Not Overlap
 * @description 重なっていないBox同士は衝突していないか
 */
it("Intersect BoxBox Not Overlap", () => {
  const box1 = new Mesh(new BoxGeometry(1, 1, 1));
  box1.rotation.copy(new Euler(0, 0, 0));
  box1.position.copy(new Vector3(0, 0, 0));
  const box2 = new Mesh(new BoxGeometry(1, 1, 1));
  box2.rotation.copy(new Euler(0, 0, 0));
  box2.position.copy(new Vector3(2, 0, 0));
  expect(detectBoxBoxCollision(box1, box2).intersect).toBe(false);
});

/**
 * BoxBoxDetector Parts Overlap With Rotation
 * @description 回転しているBox同士は一部重なっているか
 */
it("Intersect BoxBox Parts Overlap With Rotation", () => {
  const box1 = new Mesh(new BoxGeometry(1, 1, 1));
  box1.rotation.copy(new Euler(Math.PI/4, Math.PI/4, Math.PI/4));
  box1.position.copy(new Vector3(0, 0, 0));
  const box2 = new Mesh(new BoxGeometry(1, 1, 1));
  box2.rotation.copy(new Euler(Math.PI/4, 0, Math.PI/4));
  box2.position.copy(new Vector3(0, 1.25, 0));
  expect(detectBoxBoxCollision(box1, box2).intersect).toBe(true);
});

/**
 * BoxBoxDetector Not Overlap With Rotation
 * @description 回転しているBox同士は衝突していないか
 */
it("Intersect BoxBox Not Overlap With Rotation", () => {
  const box1 = new Mesh(new BoxGeometry(1, 1, 1));
  box1.rotation.copy(new Euler(Math.PI/4, Math.PI/4, Math.PI/4));
  box1.position.copy(new Vector3(0, 0, 0));
  const box2 = new Mesh(new BoxGeometry(1, 1, 1));
  box2.rotation.copy(new Euler(Math.PI/4, 0, Math.PI/4));
  box2.position.copy(new Vector3(1, 1.25, 0));
  expect(detectBoxBoxCollision(box1, box2).intersect).toBe(false);
});

/**
 * BoxBoxDetector Parts Overlap With Rotation & Scale
 * @description すべてのTransformが適用されたBox同士は一部重なっているか
 */
it("Intersect BoxBox Parts Overlap With Rotation & Scale", () => {
  const box1 = new Mesh(new BoxGeometry(1, 1, 1));
  box1.rotation.copy(new Euler(Math.PI/4, Math.PI/4, Math.PI/4));
  box1.position.copy(new Vector3(0, 0.5, 0));
  const box2 = new Mesh(new BoxGeometry(1, 1, 1));
  box2.rotation.copy(new Euler(Math.PI/4, 0, Math.PI/4));
  box2.position.copy(new Vector3(1, 1.75, 0));
  box2.scale.copy(new Vector3(2, 2, 1));
  expect(detectBoxBoxCollision(box1, box2).intersect).toBe(true);
});


