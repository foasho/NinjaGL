// pages/api/download.ts
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

async function getFileFromS3(filePath: string): Promise<Buffer> {
  const params: S3.GetObjectRequest = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: filePath,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body as Buffer);
      }
    });
  });
}

async function getFileFromLocal(filePath: string): Promise<Buffer> {
  const localFilePath = path.join(process.cwd(), AssetDir, filePath);
  return new Promise((resolve, reject) => {
    fs.readFile(localFilePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { key } = req.query;

    if (!key) {
      res.status(400).json({ error: "Missing required query parameter 'key'" });
      return;
    }

    try {
      let fileBuffer;
      if (process.env.STORAGE_TYPE === "s3") {
        fileBuffer = await getFileFromS3(key as string);
      } else {
        fileBuffer = await getFileFromLocal(key as string);
      }

      // Set appropriate headers for file download
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${key}"`);

      res.status(200).send(fileBuffer);
    } catch (error) {
      res.status(500).json({ error: "Error fetching file" });
    }
  } else {
    res.status(405).json({ error: "Only GET method is allowed" });
  }
}
