import { Vector3, Euler } from "three";
import { IObjectManagement } from "./NinjaProps";

/**
 * { x, y, z }もしくは
 * [x, y, z]もしくは
 * Vector3
 * をすべてVector3に変換する
 */
export const ConvPos = (pos: any): Vector3 => {
  if (pos instanceof Vector3) return pos;
  if (Array.isArray(pos)) return new Vector3(pos[0], pos[1], pos[2]);
  if (typeof pos === "object") return new Vector3(pos.x, pos.y, pos.z);
  return new Vector3();
};
export const Pos2Obj = (pos: any): any => {
  if (pos instanceof Vector3) return { x: pos.x, y: pos.y, z: pos.z };
  if (Array.isArray(pos)) return { x: pos[0], y: pos[1], z: pos[2] };
  return { x: pos.x, y: pos.y, z: pos.z };
};

/**
 * { x, y, z }もしくは
 * [x, y, z]もしくは
 * Euler
 * をすべてEulerに変換する
 */
export const ConvRot = (rot: any): Euler => {
  if (rot instanceof Euler) return rot;
  if (Array.isArray(rot)) return new Euler(rot[0], rot[1], rot[2]);
  if (typeof rot === "object") return new Euler(rot.x, rot.y, rot.z);
  return new Euler();
};
export const Rot2Obj = (rot: any): any => {
  if (rot instanceof Euler) return { x: rot.x, y: rot.y, z: rot.z };
  if (Array.isArray(rot)) return { x: rot[0], y: rot[1], z: rot[2] };
  return { x: rot.x, y: rot.y, z: rot.z };
};

/**
 * { x, y, z }もしくは
 * [x, y, z]もしくは
 * Vector3
 * をすべてVector3に変換する
 */
export const ConvScale = (scale: any): Vector3 => {
  if (scale instanceof Vector3) return scale;
  if (Array.isArray(scale)) return new Vector3(scale[0], scale[1], scale[2]);
  if (typeof scale === "object") return new Vector3(scale.x, scale.y, scale.z);
  return new Vector3(1, 1, 1);
};
export const Scale2Obj = (scale: any): any => {
  if (scale instanceof Vector3) return { x: scale.x, y: scale.y, z: scale.z };
  if (Array.isArray(scale)) return { x: scale[0], y: scale[1], z: scale[2] };
  return { x: scale.x, y: scale.y, z: scale.z };
};

/**
 * OMをargsすべてクラスなしのObjectに変換する
 */
export const OMArgs2Obj = (om: IObjectManagement): IObjectManagement => {
  const data = { ...om };
  const args = { ...data.args };
  if (args.position) args.position = Pos2Obj(args.position);
  if (args.velocity) args.velocity = Pos2Obj(args.velocity);
  if (args.rotation) args.rotation = Rot2Obj(args.rotation);
  if (args.scale) args.scale = Scale2Obj(args.scale);
  return data;
};
