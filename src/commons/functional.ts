

export const convertToGB = (number: number): number => {
  var gb = number / 1073741824; // 1 GB = 1,073,741,824 bytes
  return gb;
}

/**
 * 特定の数値の小数点に丸め込む
 * @param number 
 * @param decimalPlaces 
 * @returns 
 */
export const rtdp = (number: number, decimalPlaces: number): number => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
}

/**
 * 数値化できるかどうか
 */
export const isNumber = (value):boolean => {
  return typeof value === 'string' && !isNaN(Number(value));
}

// https://stackoverflow.com/a/9039885/1314762
export const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}