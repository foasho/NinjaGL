import { S3 } from "aws-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import url from "url";
import querystring from "querystring";
import { AssetDir } from "./localconfig";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

function getKeyFromSignedUrl(signedUrl: string): string {
  const parsedUrl = url.parse(signedUrl);

  if (process.env.STORAGE_TYPE === "s3") {
    const key = decodeURIComponent(parsedUrl.pathname?.substring(1) || "");
    return key;
  } else {
    const key = parsedUrl.pathname?.replace(`/${AssetDir}/`, "") || "";
    return key;
  }
}

async function deleteFileFromS3(key: string): Promise<void> {
  const params: S3.DeleteObjectRequest = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  };
  await s3.deleteObject(params).promise();
}

async function deleteFileFromLocal(directory: string): Promise<void> {
  const localDirectoryPath = path.join(process.cwd(), AssetDir, directory);
  await fs.promises.unlink(localDirectoryPath);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { signedUrl } = req.query;
    try {
      const key = getKeyFromSignedUrl(signedUrl as string);

      if (process.env.STORAGE_TYPE === "s3") {
        await deleteFileFromS3(key);
      } else {
        await deleteFileFromLocal(key);
      }
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting file" });
    }
  } else {
    res.status(405).json({ error: "Only DELETE method is allowed" });
  }
}

