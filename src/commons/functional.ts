export const convertToGB = (number: number): number => {
  var gb = number / 1073741824; // 1 GB = 1,073,741,824 bytes
  return gb;
}