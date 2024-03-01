import { NextResponse } from "next/server";

import { getPublishedProjects } from "@/db/crud/projects";

export async function GET(req: Request) {
  const projects = await getPublishedProjects();
  return NextResponse.json(projects);
}
