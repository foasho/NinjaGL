import { S3 } from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { AssetDir } from "./localconfig";
import formidable, { File } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const getSignedUrl = async (filePath: string, expires = 60 * 60): Promise<string> => {
  const signedUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: filePath,
    Expires: expires
  });
  return signedUrl;
};


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
    try {
      const data = await new Promise<{ file: File; fields: formidable.Fields }>((resolve, reject) => {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ file: files.file as File, fields });
        });
      });
      const contentType = data.file.mimetype || "application/octet-stream";
      const filePath = data.fields.filePath as string;
      const fileBuffer = await fs.promises.readFile(data.file.filepath);

      let result: any = {};
      if (process.env.STORAGE_TYPE === "s3") {
        result.data = await uploadFileToS3(fileBuffer, contentType, filePath);
        result.url = await getSignedUrl(filePath);
      
      } else {
        result.data = await saveFileToLocal(fileBuffer, contentType, filePath);
        result.url = `${AssetDir}/${filePath}`;
      }
      res.status(200).json({ message: "File uploaded successfully", data: result });
    } catch (error) {
      res.status(500).json({ error: "Error uploading file" });
    }
  } else {
    res.status(405).json({ error: "Only POST method is allowed" });
  }
}