import { list, type ListCommandOptions } from "@vercel/blob";

export const runtime = "edge";

/**
 * // pathnameが prefixに収まらないものは、フォルダデータとしてsize0のものに変換
 * @param prefix
 * @param pathname
 * @returns
 */
const isFolder = (prefix: string, pathname: string) => {
  let p = prefix.length > 0 ? prefix : "";
  if (p.length > 0 && p[p.length - 1] !== "/") {
    p = p + "/";
  }
  const path = pathname.replace(p, "");
  const pathArray = path.split("/");
  return pathArray.length == 2;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let options: ListCommandOptions = {
    token: process.env.SOLB_READ_WRITE_TOKEN,
  };
  // prefix: string, limit: number, offset: number
  const prefix = searchParams.get("prefix") || "";
  const limit = Number(searchParams.get("limit")) || 100;
  const cursor = (searchParams.get("cursor") as string) || null;
  if (prefix) {
    options = { ...options, prefix };
  }
  if (limit) {
    options = { ...options, limit };
  }
  if (cursor) {
    options = { ...options, cursor };
  }
  // {
  //   size: `number`;
  //   uploadedAt: `Date`;
  //   pathname: `test/pathname.png`;
  //   url: `https://...`;
  // }
  const { blobs } = await list(options);
  const filteredBlobs: any[] = [];
  // pathnameが prifixに収まらないものは、フォルダデータとしてsize0のものに変換
  blobs.forEach((blob) => {
    console.log(blob);
    const filename = blob.pathname.split("/").pop();
    if (isFolder(prefix, blob.pathname)) {
      // forlderまでのpathnameに変換
      const pathArray = blob.pathname.split("/");
      const folderPath = pathArray.slice(0, pathArray.length - 1).join("/");
      const folderName = folderPath.split("/").pop();
      const p = {
        ...blob,
        size: 0,
        url: folderPath,
        filename: folderName,
        isFile: false,
        isDirectory: true,
      };
      if (!filteredBlobs.find((b) => b.url === p.url)) {
        filteredBlobs.push(p);
      }
    } else {
      const p = {
        ...blob,
        filename,
        isFile: true,
        isDirectory: false,
      };
      filteredBlobs.push(p);
    }
  });
  return Response.json(filteredBlobs);
}
