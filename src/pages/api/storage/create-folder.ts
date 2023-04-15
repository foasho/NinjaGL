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

async function createFolderS3(prefix: string): Promise<void> {
  const params: S3.PutObjectRequest = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `${prefix}/`,
  };

  await s3.putObject(params).promise();
}

async function createFolderLocal(directory: string): Promise<void> {
  const localDirectoryPath = path.join(process.cwd(), AssetDir, directory);
  await fs.promises.mkdir(localDirectoryPath, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { prefix } = req.body;

    if (!prefix) {
      res.status(400).json({ error: "Missing required body parameter 'prefix'" });
      return;
    }

    try {
      if (process.env.STORAGE_TYPE === "s3") {
        await createFolderS3(prefix);
      } else {
        await createFolderLocal(prefix);
      }

      res.status(200).json({ message: "Folder created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error creating folder" });
    }
  } else {
    res.status(405).json({ error: "Only POST method is allowed" });
  }
}
