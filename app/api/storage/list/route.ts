import { list, type ListCommandOptions } from '@vercel/blob';
 
export const runtime = 'edge';

/**
 * // pathnameが prefixに収まらないものは、フォルダデータとしてsize0のものに変換
 * @param prefix
 * @param pathname
 * @returns 
 */
const isFolder = (prefix: string, pathname: string) => {
  let p = prefix.length > 0 ? prefix : '/';
  const path = pathname.replace(p, '');
  const pathArray = path.split('/');
  return pathArray.length >= 1;
}
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let options: ListCommandOptions = {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  };
  // prefix: string, limit: number, offset: number
  const prefix = searchParams.get('prefix') || null;
  const limit = Number(searchParams.get('limit')) || 100;
  const cursor = searchParams.get('cursor') as string || null;
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
  // pathnameが prifixに収まらないものは、フォルダデータとしてsize0のものに変換
  const filteredBlobs = blobs.map(blob => {
    const filename = blob.pathname.split('/').pop();
    if (prefix && isFolder(prefix, blob.pathname)) {
      // forlderまでのpathnameに変換
      const pathArray = blob.pathname.split('/');
      const folderPath = pathArray.slice(0, pathArray.length - 1).join('/');
      return {
        ...blob,
        size: 0,
        url: folderPath,
        filename,
        isFile: false,
        isDirectory: true,
      }
    }
    return {
      ...blob,
      filename,
      isFile: true,
      isDirectory: false,
    };
  });
  return Response.json(filteredBlobs);
}