/**
 * 参考: Oimo.js
 * https://github.com/lo-th/Oimo.js/blob/gh-pages/src/collision/narrowphase/SphereSphereCollisionDetector_X.js
 */
import { getInitCollision, ResultCollisionProps } from "./Common";
import { Mesh, SphereGeometry, Vector3 } from "three";

const c1 = new Vector3();
const c2 = new Vector3();
const n = new Vector3();
const p = new Vector3();

export const detectSphereSphereCollision = (
  sphereMesh1: Mesh,
  sphereMesh2: Mesh
): ResultCollisionProps => {
  const res = getInitCollision();

  const radius1 = (sphereMesh1.geometry as SphereGeometry).parameters.radius;
  const radius2 = (sphereMesh2.geometry as SphereGeometry).parameters.radius;

  const scaledRadius1 = radius1 * Math.max(...sphereMesh1.scale.toArray());
  const scaledRadius2 = radius2 * Math.max(...sphereMesh2.scale.toArray());

  const rad = scaledRadius1 + scaledRadius2;
  c1.copy(sphereMesh1.position);
  c2.copy(sphereMesh2.position);
  const normal = n.subVectors(c2, c1);
  const distance = normal.length();

  if (distance <= rad) {
    normal.normalize();
    p.copy(c1).add(normal.clone().multiplyScalar(scaledRadius1));
    res.intersect = true;
    res.distance = distance;
    res.point.copy(p);
    res.castDirection.copy(normal);
    res.recieveDirection.copy(normal.clone().negate());
  }

  return res;
};
