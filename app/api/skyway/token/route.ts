import { SkywayTokenApi } from "@ninjagl/api";

export async function GET(req: Request) {
  return Response.json(await SkywayTokenApi());
}
