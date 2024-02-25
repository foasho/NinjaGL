import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { createOrUpdateOm } from "@/db/crud/oms";
import { getProjectsByUserId } from "@/db/crud/projects";
import { getMergedSessionServer } from "@/middleware";

export async function POST(req: Request) {
  const { projectId, om } = await req.json();
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const projects = await getProjectsByUserId(mergedSession.user.id);
  // projectIdがprojectsに含まれているかチェック
  if (!projects.some((project) => project.id === Number(projectId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  // omの更新
  await createOrUpdateOm(projectId, om.id, om);
  return NextResponse.json({ message: "OK" });
}
