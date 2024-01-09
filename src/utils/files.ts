export const getExtension = (filename: string): string => {
  if (filename === undefined) return "";
  const name = filename.split(".").pop();
  return name!.toLowerCase();
};

export const isImage = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
};

export const gltf_icon = "/fileicons/gltf.png";
export const object_icon = "/fileicons/object.png";
export const isGLTF = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["glb", "gltf"].includes(ext);
};

export const mp3_icon = "/fileicons/mp3.png";
export const isMP3 = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["mp3"].includes(ext);
};

export const glsl_icon = "/fileicons/glsl.png";
export const isGLSL = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["glsl"].includes(ext);
};

export const js_icon = "/fileicons/js.png";
export const isJS = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["js"].includes(ext);
};

export const njc_icon = "/fileicons/njc.png";
export const isNJC = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["njc"].includes(ext);
};

export const terrain_icon = "/fileicons/terrain.png";
export const isTerrain = (filename: string): boolean => {
  const ext = getExtension(filename);
  return ["ter"].includes(ext);
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
