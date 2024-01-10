import { list, del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  let alreadyUploaded = false;
  const { blobs } = await list({ token: process.env.SOLB_READ_WRITE_TOKEN });
  let deletingBlobs: any[] = [];
  // filenameがすでに存在する場合は、削除する対象を探す
  if (body.payload["pathname"]) {
    deletingBlobs = [...blobs.filter((blob) => blob.pathname === body.payload["pathname"])];
  }

  try {
    const jsonResponse = await handleUpload({
      token: process.env.SOLB_READ_WRITE_TOKEN,
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {};
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          // TODO: DBを使っている場合はここで処理を追加する
          // 削除する
          deletingBlobs.forEach(async (blob) => {
            await del(blob.url, { token: process.env.SOLB_READ_WRITE_TOKEN });
          });
        } catch (error) {
          throw new Error("Could not update user");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
