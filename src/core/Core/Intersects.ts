import { Box3, Plane, Sphere, Vector3 } from "three";
import { Face } from "./Octree";

export interface IIntersectProps {
  distance?: number;
  contactPoint: Vector3;
  face?: Face
}

/**
 * 物理エンジン(ベース: MeshWalk.js)
 * @description コーディングルール
 * ・変数はvarで固定　※Letは正しく使わないと速度低下するため
 * ・
 */

let vec3: Vector3 = new Vector3();
let vec3_0: Vector3 = new Vector3();
let vec3_1: Vector3 = new Vector3();
let center: Vector3 = new Vector3();
let extents: Vector3 = new Vector3();

/**
 * Box <-> Plane用変数
 */
let v0: Vector3 = new Vector3();
let v1: Vector3 = new Vector3();
let v2: Vector3 = new Vector3();
let f0: Vector3 = new Vector3();
let f1: Vector3 = new Vector3();
let f2: Vector3 = new Vector3();
let a00: Vector3 = new Vector3();
let a01: Vector3 = new Vector3();
let a02: Vector3 = new Vector3();
let a10: Vector3 = new Vector3();
let a11: Vector3 = new Vector3();
let a12: Vector3 = new Vector3();
let a20: Vector3 = new Vector3();
let a21: Vector3 = new Vector3();
let a22: Vector3 = new Vector3();
let plane: Plane = new Plane();

/**
* BoxとPlaneの衝突検出
* @param box  Box3
* @param plane Plane
* @returns 
*/
export const isInstersectBoxPlane = (box: Box3, plane: Plane) => {
  center.addVectors(box.max, box.min).multiplyScalar(0.5);
  extents.subVectors(box.max, center);
  var r = extents.x * Math.abs(plane.normal.x) + extents.y * Math.abs(plane.normal.y) + extents.z * Math.abs(plane.normal.z);
  var s = plane.normal.dot(center) - plane.constant;
  return Math.abs(s) <= r;
}

/**
     * AABBアルゴリズムによる衝突検知
     * ベース：https://gist.github.com/zvonicek/fe73ba9903f49d57314cf7e8e0f05dcf
     * "Boxと3角形"
     * @param a: 三角形頂点1
     * @param b: 三角形頂点2
     * @param c: 三角形頂点3
     */
export const isIntersectTriAABB = (a: Vector3, b: Vector3, c: Vector3, aabb: Box3): boolean => {
  var p0: number, p1: number, p2: number, r: number;
  center.addVectors(aabb.max, aabb.min).multiplyScalar(0.5);
  extents.subVectors(aabb.max, center);

  v0.subVectors(a, center);
  v1.subVectors(b, center);
  v2.subVectors(c, center);

  f0.subVectors(v1, v0);
  f1.subVectors(v2, v1);
  f2.subVectors(v0, v2);

  // a00...a22 テスト(カテゴリ3)
  a00.set(0, -f0.z, f0.y);
  a01.set(0, -f1.z, f1.y);
  a02.set(0, -f2.z, f2.y);
  a10.set(f0.z, 0, -f0.x);
  a11.set(f1.z, 0, -f1.x);
  a12.set(f2.z, 0, -f2.x);
  a20.set(-f0.y, f0.x, 0);
  a21.set(-f1.y, f1.x, 0);
  a22.set(-f2.y, f2.x, 0);

  // a00
  p0 = v0.dot(a00);
  p1 = v1.dot(a00);
  p2 = v2.dot(a00);
  r = extents.y * Math.abs(f0.z) + extents.z * Math.abs(f0.y);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a01
  p0 = v0.dot(a01);
  p1 = v1.dot(a01);
  p2 = v2.dot(a01);
  r = extents.y * Math.abs(f1.z) + extents.z * Math.abs(f1.y);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a02
  p0 = v0.dot(a02);
  p1 = v1.dot(a02);
  p2 = v2.dot(a02);
  r = extents.y * Math.abs(f2.z) + extents.z * Math.abs(f2.y);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a10
  p0 = v0.dot(a10);
  p1 = v1.dot(a10);
  p2 = v2.dot(a10);
  r = extents.x * Math.abs(f0.z) + extents.z * Math.abs(f0.x);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a11
  p0 = v0.dot(a11);
  p1 = v1.dot(a11);
  p2 = v2.dot(a11);
  r = extents.x * Math.abs(f1.z) + extents.z * Math.abs(f1.x);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a12
  p0 = v0.dot(a12);
  p1 = v1.dot(a12);
  p2 = v2.dot(a12);
  r = extents.x * Math.abs(f2.z) + extents.z * Math.abs(f2.x);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a20
  p0 = v0.dot(a20);
  p1 = v1.dot(a20);
  p2 = v2.dot(a20);
  r = extents.x * Math.abs(f0.y) + extents.y * Math.abs(f0.x);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  //a21
  p0 = v0.dot(a21);
  p1 = v1.dot(a21);
  p2 = v2.dot(a21);
  r = extents.x * Math.abs(f1.y) + extents.y * Math.abs(f1.x);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // a22
  p0 = v0.dot(a22);
  p1 = v1.dot(a22);
  p2 = v2.dot(a22);
  r = extents.x * Math.abs(f2.y) + extents.y * Math.abs(f2.x);
  if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
    return false; // Axis is a separating axis
  }

  // Test the three axes corresponding to the face normals of AABB b (category 1).
  // Exit if...
  // ... [-extents.x, extents.x] and [min(v0.x,v1.x,v2.x), max(v0.x,v1.x,v2.x)] do not overlap
  if (Math.max(v0.x, v1.x, v2.x) < -extents.x || Math.min(v0.x, v1.x, v2.x) > extents.x) {
    return false;
  }

  // ... [-extents.y, extents.y] and [min(v0.y,v1.y,v2.y), max(v0.y,v1.y,v2.y)] do not overlap
  if (Math.max(v0.y, v1.y, v2.y) < -extents.y || Math.min(v0.y, v1.y, v2.y) > extents.y) {
    return false;
  }

  // ... [-extents.z, extents.z] and [min(v0.z,v1.z,v2.z), max(v0.z,v1.z,v2.z)] do not overlap
  if (Math.max(v0.z, v1.z, v2.z) < -extents.z || Math.min(v0.z, v1.z, v2.z) > extents.z) {
    return false;
  }

  // Test separating axis corresponding to triangle face normal (category 2)
  // Face Normal is -ve as Triangle is clockwise winding (and XNA uses -z for into screen)
  plane.normal.copy(f1).cross(f0).normalize();
  plane.constant = plane.normal.dot(a);
  return isInstersectBoxPlane(aabb, plane);
}


/**
 * Box <-> Sphere用変数
 */
let A: Vector3 = new Vector3();
let B: Vector3 = new Vector3();
let C: Vector3 = new Vector3();
let V: Vector3 = new Vector3();
let AB: Vector3 = new Vector3();
let BC: Vector3 = new Vector3();
let CA: Vector3 = new Vector3();
let Q1: Vector3 = new Vector3();
let Q2: Vector3 = new Vector3();
let Q3: Vector3 = new Vector3();
let QC: Vector3 = new Vector3();
let QA: Vector3 = new Vector3();
let QB: Vector3 = new Vector3();
let negatedNormal: Vector3 = new Vector3();

/**
     * BoxとSphereとの検出
     */
export const isInstersectSphereBox = (sphere: Sphere, box: Box3): boolean => {
  var sqDist: number = 0;
  if (sphere.center.x < box.min.x) sqDist += (box.min.x - sphere.center.x) * (box.min.x - sphere.center.x);
  if (sphere.center.x > box.max.x) sqDist += (sphere.center.x - box.max.x) * (sphere.center.x - box.max.x);
  if (sphere.center.y < box.min.y) sqDist += (box.min.y - sphere.center.y) * (box.min.y - sphere.center.y);
  if (sphere.center.y > box.max.y) sqDist += (sphere.center.y - box.max.y) * (sphere.center.y - box.max.y);
  if (sphere.center.z < box.min.z) sqDist += (box.min.z - sphere.center.z) * (box.min.z - sphere.center.z);
  if (sphere.center.z > box.max.z) sqDist += (sphere.center.z - box.max.z) * (sphere.center.z - box.max.z);
  return sqDist <= sphere.radius * sphere.radius;
}


/**
 * Segment <-> Triangle用変数
 */
let ab: Vector3 = new Vector3();
let ac: Vector3 = new Vector3();
let qp: Vector3 = new Vector3();
let n: Vector3 = new Vector3();
let ap: Vector3 = new Vector3();
let e: Vector3 = new Vector3();
let au: Vector3 = new Vector3();
let bv: Vector3 = new Vector3();
let cw: Vector3 = new Vector3();

/**
 * Sphereと三角形の衝突検出
 * @param sphere Sphere: 球体データ
 * @param a      頂点a
 * @param b      頂点b
 * @param c      頂点c
 * @param normal 法線ベクトル
 */
export const isIntersectTriSphere = (
  sphere: any,
  a: Vector3,
  b: Vector3,
  c: Vector3,
  normal: Vector3
): IIntersectProps => {
  A.subVectors(a, sphere.center);
  B.subVectors(b, sphere.center);
  C.subVectors(c, sphere.center);
  var rr = sphere.radius * sphere.radius;
  V.crossVectors(vec3_0.subVectors(B, A), vec3_1.subVectors(C, A));
  var d = A.dot(A);
  var e = V.dot(V);
  if (d * d > rr * e) {
    return null;
  }

  // 頂点
  var aa = A.dot(A);
  var ab = A.dot(B);
  var ac = A.dot(C);
  var bb = A.dot(B);
  var bc = A.dot(C);
  var cc = A.dot(C);
  if (aa > rr && ab > aa && ac > aa || bb > rr && ab > bb && bc > bb || cc > rr && ac > cc && bc > cc) {
    return null;
  }

  // 輪郭線
  AB.subVectors(B, A);
  BC.subVectors(C, B);
  CA.subVectors(A, C);
  var d1 = ab - aa;
  var d2 = bc - bb;
  var d3 = ac - cc;
  var e1 = AB.dot(AB);
  var e2 = BC.dot(BC);
  var e3 = CA.dot(CA);
  Q1.subVectors(A.multiplyScalar(e1), AB.multiplyScalar(d1));
  Q2.subVectors(B.multiplyScalar(e2), BC.multiplyScalar(d2));
  Q3.subVectors(C.multiplyScalar(e3), CA.multiplyScalar(d3));
  QC.subVectors(C.multiplyScalar(e1), Q1);
  QA.subVectors(A.multiplyScalar(e2), Q2);
  QB.subVectors(B.multiplyScalar(e3), Q3);
  if (Q1.dot(Q1) > rr * e1 * e1 && Q1.dot(QC) >= 0 || Q2.dot(Q2) > rr * e2 * e2 && Q2.dot(QA) >= 0 || Q3.dot(Q3) > rr * e3 * e3 && Q3.dot(QB) >= 0) {
    return null;
  }
  var distance = Math.sqrt(d * d / e) - sphere.radius - 1;
  negatedNormal.set(-normal.x, -normal.y, -normal.z);
  var contactPoint = sphere.center.clone().add(negatedNormal.multiplyScalar(distance));
  return {
    distance: distance,
    contactPoint: contactPoint,
    face: null
  };
}

/**
 * 辺と三角形衝突ベクトル
 * @param p 辺の位置ベクトル1
 * @param q 辺の位置ベクトル2
 * @param a 三角形の頂点ベクトル1
 * @param b 三角形の頂点ベクトル2
 * @param c 三角形の頂点ベクトル3
 */
export const detectSegmentTriangle = (
  p: Vector3,
  q: Vector3,
  a: Vector3,
  b: Vector3,
  c: Vector3
): Vector3 => {
  ab.subVectors(b, a);
  ac.subVectors(c, a);
  qp.subVectors(p, q);
  n.copy(ab).cross(ac);
  var d = qp.dot(n);
  if (d <= 0) return null;
  ap.subVectors(p, a);
  var t = ap.dot(n);
  if (t < 0) return null;
  if (t > d) return null;
  e.copy(qp).cross(ap);
  var v = ac.dot(e);
  if (v < 0 || v > d) return null;
  var w = vec3.copy(ab).dot(e) * -1;
  if (w < 0 || v + w > d) return null;
  var ood = 1 / d;
  t *= ood;
  v *= ood;
  w *= ood;
  var u = 1 - v - w;
  au.copy(a).multiplyScalar(u);
  bv.copy(b).multiplyScalar(v);
  cw.copy(c).multiplyScalar(w);
  // var contactPoint = au.clone().add(bv).add(cw);
  return au.clone().add(bv).add(cw);
}


/**
 * 計算関数用定数
 */
const TURN_DURATION = 200;
const TAU = 2 * Math.PI;
const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI / 2;
const EPSILON = 1e-5;
const DEG2RAD = Math.PI / 180;

/**
 * カメラ定数
 * camera-controls
 * see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons#value
 */
const MOUSE_BUTTON = {
  LEFT: 1,
  RIGHT: 2,
  MIDDLE: 4,
};
const ACTION = Object.freeze({
  NONE: 0,
  ROTATE: 1,
  TRUCK: 2,
  OFFSET: 4,
  DOLLY: 8,
  ZOOM: 16,
  TOUCH_ROTATE: 32,
  TOUCH_TRUCK: 64,
  TOUCH_OFFSET: 128,
  TOUCH_DOLLY: 256,
  TOUCH_ZOOM: 512,
  TOUCH_DOLLY_TRUCK: 1024,
  TOUCH_DOLLY_OFFSET: 2048,
  TOUCH_DOLLY_ROTATE: 4096,
  TOUCH_ZOOM_TRUCK: 8192,
  TOUCH_ZOOM_OFFSET: 16384,
  TOUCH_ZOOM_ROTATE: 32768,
});


/**
 * カメラ
 */
export const isPerspectiveCamera = (camera): any => {
  return camera.isPerspectiveCamera;
}
export const isOrthographicCamera = (camera): any => {
  return camera.isOrthographicCamera;
}

/**
 * 計算関数
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
}
export const approxZero = (number, error = EPSILON) => {
  return Math.abs(number) < error;
}
export const approxEquals = (a, b, error = EPSILON) => {
  return approxZero(a - b, error);
}
export const roundToStep = (value, step) => {
  return Math.round(value / step) * step;
}
export const infinityToMaxNumber = (value) => {
  if (isFinite(value))
    return value;
  if (value < 0)
    return -Number.MAX_VALUE;
  return Number.MAX_VALUE;
}
export const maxNumberToInfinity = (value) => {
  if (Math.abs(value) < Number.MAX_VALUE)
    return value;
  return value * Infinity;
}
export const smoothDamp = (
  current,
  target,
  currentVelocityRef,
  smoothTime,
  maxSpeed = Infinity,
  deltaTime
) => {
  // Based on Game Programming Gems 4 Chapter 1.10
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const originalTo = target;
  // Clamp maximum speed
  const maxChange = maxSpeed * smoothTime;
  change = clamp(change, -maxChange, maxChange);
  target = current - change;
  const temp = (currentVelocityRef.value + omega * change) * deltaTime;
  currentVelocityRef.value = (currentVelocityRef.value - omega * temp) * exp;
  let output = target + (change + temp) * exp;
  // Prevent overshooting
  if (originalTo - current > 0.0 === output > originalTo) {
    output = originalTo;
    currentVelocityRef.value = (output - originalTo) / deltaTime;
  }
  return output;
}
export const smoothDampVec3 = (
  current,
  target,
  currentVelocityRef,
  smoothTime,
  maxSpeed = Infinity,
  deltaTime,
  out
) => {
  // Based on Game Programming Gems 4 Chapter 1.10
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let changeX = current.x - target.x;
  let changeY = current.y - target.y;
  let changeZ = current.z - target.z;
  const originalToX = target.x;
  const originalToY = target.y;
  const originalToZ = target.z;
  // Clamp maximum speed
  const maxChange = maxSpeed * smoothTime;
  const maxChangeSq = maxChange * maxChange;
  const magnitudeSq = changeX * changeX + changeY * changeY + changeZ * changeZ;
  if (magnitudeSq > maxChangeSq) {
    const magnitude = Math.sqrt(magnitudeSq);
    changeX = changeX / magnitude * maxChange;
    changeY = changeY / magnitude * maxChange;
    changeZ = changeZ / magnitude * maxChange;
  }
  target.x = current.x - changeX;
  target.y = current.y - changeY;
  target.z = current.z - changeZ;
  const tempX = (currentVelocityRef.x + omega * changeX) * deltaTime;
  const tempY = (currentVelocityRef.y + omega * changeY) * deltaTime;
  const tempZ = (currentVelocityRef.z + omega * changeZ) * deltaTime;
  currentVelocityRef.x = (currentVelocityRef.x - omega * tempX) * exp;
  currentVelocityRef.y = (currentVelocityRef.y - omega * tempY) * exp;
  currentVelocityRef.z = (currentVelocityRef.z - omega * tempZ) * exp;
  out.x = target.x + (changeX + tempX) * exp;
  out.y = target.y + (changeY + tempY) * exp;
  out.z = target.z + (changeZ + tempZ) * exp;
  // Prevent overshooting
  const origMinusCurrentX = originalToX - current.x;
  const origMinusCurrentY = originalToY - current.y;
  const origMinusCurrentZ = originalToZ - current.z;
  const outMinusOrigX = out.x - originalToX;
  const outMinusOrigY = out.y - originalToY;
  const outMinusOrigZ = out.z - originalToZ;
  if (origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY + origMinusCurrentZ * outMinusOrigZ > 0) {
    out.x = originalToX;
    out.y = originalToY;
    out.z = originalToZ;
    currentVelocityRef.x = (out.x - originalToX) / deltaTime;
    currentVelocityRef.y = (out.y - originalToY) / deltaTime;
    currentVelocityRef.z = (out.z - originalToZ) / deltaTime;
  }
  return out;
}
export const extractClientCoordFromEvent = (
  pointers,
  out
) => {
  out.set(0, 0);
  pointers.forEach((pointer) => {
    out.x += pointer.clientX;
    out.y += pointer.clientY;
  });
  out.x /= pointers.length;
  out.y /= pointers.length;
}
export const notSupportedInOrthographicCamera = (
  camera,
  message
) => {
  if (isOrthographicCamera(camera)) {
    console.warn(`${message} is not supported in OrthographicCamera`);
    return true;
  }
  return false;
}