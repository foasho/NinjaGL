import { del } from "@vercel/blob";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlToDelete = searchParams.get("url") as string;
  await del(urlToDelete, {
    token: process.env.SOLB_READ_WRITE_TOKEN,
  });

  return new Response();
}
