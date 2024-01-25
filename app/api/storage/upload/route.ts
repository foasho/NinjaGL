import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  const { blobs } = await list({ token: process.env.SOLB_READ_WRITE_TOKEN });
  // filenameがすでに存在する場合は、削除する対象を探す
  const deletingBlobs = blobs.filter((blob) => blob.pathname === filename);

  const blob = await put(filename!, request.body!, {
    access: "public",
    token: process.env.SOLB_READ_WRITE_TOKEN,
  });

  // 削除する
  deletingBlobs.forEach(async (blob) => {
    await del(blob.url, { token: process.env.SOLB_READ_WRITE_TOKEN });
  });

  return NextResponse.json(blob);
}
