import type { Object3D, Vector3 } from "three";

import { Buffer } from "buffer";

export const convertToGB = (number: number): number => {
  let gb = number / 1073741824; // 1 GB = 1,073,741,824 bytes
  return gb;
};

/**
 * 特定の数値の小数点に丸め込む
 * @param number
 * @param decimalPlaces
 * @returns
 */
export const rtdp = (number: number, decimalPlaces: number): number => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
};

/**
 * 数値化できるかどうか
 */
export const isNumber = (value: any): boolean => {
  return typeof value === "string" && !isNaN(Number(value));
};

// https://stackoverflow.com/a/9039885/1314762
export const isIOS = () => {
  return (
    ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};

export const b64EncodeUnicode = (str: string): string => {
  const encodedStr = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
  return Buffer.from(encodedStr).toString("base64");
};

/**
 * カメラと任意の位置の距離を取得し、閾値より小さければクリックを有効にする
 * @param cameraPosition
 * @param targetPosition
 */
export const EnableClickTrigger = (cameraPosition: Vector3, target: Object3D, ratio: number = 1.5) => {
  if (!target) return false;
  const distance = cameraPosition.distanceTo(target.position);
  const scale = target.scale;
  const averageScale = (scale.x + scale.y + scale.z) / 3;
  const maxDistance = ratio * averageScale; // Ratioは任意の係数で、適切な値に調整
  return distance > maxDistance;
};
