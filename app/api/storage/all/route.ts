import { list, type ListCommandOptions } from "@vercel/blob";

export const runtime = "edge";

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
  const mergedNamesBlobs: any[] = [];
  // pathnameが prifixに収まらないものは、フォルダデータとしてsize0のものに変換
  blobs.forEach((blob) => {
    const filename = blob.pathname.split("/").pop();
    const p = {
      ...blob,
      filename,
    };
    mergedNamesBlobs.push(p);
  });
  return Response.json(mergedNamesBlobs);
}
