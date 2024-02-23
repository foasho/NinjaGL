import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getProjectsByUserId } from "@/db/crud/projects";
import { getMergedSessionServer } from "@/middleware";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const projects = await getProjectsByUserId(mergedSession.user.id);
  return NextResponse.json(projects);
}

// export async function POST(req: Request) {}

// export async function PUT(req: Request) {}
