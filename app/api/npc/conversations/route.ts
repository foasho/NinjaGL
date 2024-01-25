import { NpcApi } from "@ninjagl/api";

export async function POST(req: Request) {
  const { conversations } = await req.json();
  return Response.json(await NpcApi(conversations));
}
