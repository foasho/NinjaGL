const s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const genRandom = (n: number = 6) => {
  return Array.from(Array(n))
    .map(() => s[Math.floor(Math.random() * s.length)])
    .join("");
};
