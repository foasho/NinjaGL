import { S3 } from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { AssetDir } from "./localconfig";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

interface UploadRequestBody {
  file: string;
  filePath: string;
  contentType: string;
}

const uploadFileToS3 = async (file: Buffer, contentType: string, filePath: string): Promise<S3.ManagedUpload.SendData> => {
  const params: S3.PutObjectRequest = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key:  filePath,
    Body: file,
    ContentType: contentType,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const saveFileToLocal = async (file: Buffer, contentType: string, key: string): Promise<string> => {
  const localUploadPath = path.join(process.cwd(), AssetDir, key);
  return new Promise((resolve, reject) => {
    fs.writeFile(localUploadPath, file, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(`File saved at ${localUploadPath}`);
      }
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { file, contentType, filePath } = req.body as UploadRequestBody;
    const fileBuffer = Buffer.from(file, "base64");

    try {
      let result;
      if (process.env.STORAGE_TYPE === "s3") {
        result = await uploadFileToS3(fileBuffer, contentType, filePath);
      } else {
        result = await saveFileToLocal(fileBuffer, contentType, filePath);
      }
        res.status(200).json({ message: "File uploaded successfully", data: result });
      } catch (error) {
        res.status(500).json({ error: "Error uploading file" });
    }
  } else {
    res.status(405).json({ error: "Only POST method is allowed" });
  }
}