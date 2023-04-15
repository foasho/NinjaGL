// pages/api/list.ts
import { S3 } from "aws-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { AssetDir } from "./localconfig";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function listFilesAndFoldersFromS3(prefix: string, limit: number, offset: number): Promise<{ items: S3.Object[], maxPages: number }> {
  const params: S3.ListObjectsV2Request = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Prefix: prefix,
    Delimiter: "/",
  };
  let response;
  let items = [];
  let fetchedItems = 0;
  let currentPage = 1;

  do {
    response = await s3.listObjectsV2(params).promise();

    const files = response.Contents || [];
    const folders = response.CommonPrefixes || [];

    if (currentPage * limit >= offset) {
      items = items.concat(files.slice(offset - fetchedItems, limit)).concat(folders);
      fetchedItems += files.length;
    }

    currentPage++;
    (params as any).Marker = response.NextMarker;

  } while (response.IsTruncated);

  const hasMore = items.length > limit;
  const maxPages = Math.ceil(fetchedItems / limit);

  const _items = items.filter((item) => {
    return item.Key !== prefix;
  });

  if (hasMore) {
    _items.pop(); // Remove the extra file
  }

  // Generate signed URLs for files
  const signedFiles = await Promise.all(_items.map(async (item) => {
    if (item.Size) { // It's a file
      const signedUrl = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: item.Key,
        Expires: 60 * 60, // 1 hour
      });
      return {
        ...item,
        Key: item.Key.replace(prefix, ""),
        signedUrl,
      };
    } else {
      return {
        Key: item.Prefix.replace(prefix, ""),
        signedUrl: null,
      }; // It's a folder
    }
  }));

  // usersファルダは、除外する
  const filteredItems = signedFiles.filter((item) => {
    return item.Key !== "users/";
  });

  
  return { items: filteredItems, maxPages };
}


async function listFilesAndFoldersFromLocal(directory: string, limit: number, offset: number): Promise<{ items: any[], maxPages: number }> {
  const localDirectoryPath = path.join(process.cwd(), AssetDir, directory);
  const allItems = await fs.promises.readdir(localDirectoryPath, { withFileTypes: true });
  const items = allItems.slice(offset, offset + limit).filter((item) => {
    const itemPath = path.join(localDirectoryPath, item.name);
    const itemStat = fs.statSync(itemPath);
    return itemStat.isFile() || (itemStat.isDirectory() && !item.name.includes("/"));
  });
  const maxPages = Math.ceil(allItems.length / limit);

  // Generate relative URLs for files
  const itemsWithUrls = items.map((item) => ({
    ...item,
    signedUrl: `/${AssetDir}/${directory}/${item.name}`,
  }));

  return { items: itemsWithUrls, maxPages };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { prefix = "", limit = 9, offset = 0 } = req.query;
    try {
      let result;
      if (process.env.STORAGE_TYPE === "s3") {
        result = await listFilesAndFoldersFromS3(prefix as string, parseInt(limit as string, 10), parseInt(offset as string, 10));
      } else {
        result = await listFilesAndFoldersFromLocal(prefix as string, parseInt(limit as string, 10), parseInt(offset as string, 10));
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error listing files" });
    }
  } else {
    res.status(405).json({ error: "Only GET method is allowed" });
  }
}
