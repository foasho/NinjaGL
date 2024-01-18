import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";

export const uploadFile = async (file: File, filePath: string): Promise<PutBlobResult | null> => {
  try {
    if (process.env.NEXT_PUBLIC_UPLOAD_TYPE === "client") {
      const newBlob = await upload(filePath, file, {
        access: "public",
        handleUploadUrl: "/api/storage/upload-client",
      });
      return newBlob;
    } else {
      const response = await fetch(`/api/storage/upload?filename=${filePath}`, {
        method: "POST",
        body: file,
      });
      const resResult = (await response.json()) as PutBlobResult;
      return resResult;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};
