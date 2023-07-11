// pages/api/deleteFolder.ts
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

async function deleteFolderS3(prefix: string): Promise<void> {
  const listParams: S3.ListObjectsV2Request = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Prefix: prefix,
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();
  const deleteParams: S3.DeleteObjectsRequest = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Delete: { Objects: [] },
  };

  if (listedObjects.Contents!.length === 0) {
    throw new Error("Folder not found");
  }

  listedObjects.Contents!.forEach(({ Key }) => {
    deleteParams.Delete!.Objects!.push({ Key: Key! });
  });

  await s3.deleteObjects(deleteParams).promise();
}

async function deleteFolderLocal(directory: string): Promise<void> {
  const localDirectoryPath = path.join(process.cwd(), AssetDir, directory);

  // fsライブラリで削除するように修正予定
  // return new Promise((resolve, reject) => {
  //   rimraf(localDirectoryPath, (error) => {
  //     if (error) {
  //       reject(error);
  //     } else {
  //       resolve();
  //     }
  //   });
  // });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { prefix } = req.body;

    if (!prefix) {
      res.status(400).json({ error: "Missing required body parameter 'prefix'" });
      return;
    }

    try {
      if (process.env.STORAGE_TYPE === "s3") {
        await deleteFolderS3(prefix);
      } else {
        await deleteFolderLocal(prefix);
      }

      res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting folder" });
    }
  } else {
    res.status(405).json({ error: "Only DELETE method is allowed" });
  }
}
