import { Vector3 } from "three";

export type ResultCollisionProps = {
  intersect: boolean;
  distance: number;
  castDirection: Vector3;
  recieveDirection: Vector3;
  point: Vector3;
};

const cd = new Vector3();
const rd = new Vector3();
const p = new Vector3();
export const getInitCollision = (): ResultCollisionProps => {
  return {
    intersect: false,
    distance: 0,
    castDirection: cd,
    recieveDirection: rd,
    point: p,
  };
};
