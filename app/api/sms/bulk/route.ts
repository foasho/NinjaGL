import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getProjectsByUserId } from "@/db/crud/projects";
import { createOrUpdateSm, deleteSmsByProjectId } from "@/db/crud/sms";
import { getMergedSessionServer } from "@/middleware";

export async function POST(req: Request) {
  const { projectId, sms } = await req.json();
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const projects = await getProjectsByUserId(mergedSession.user.id);
  // projectIdがprojectsに含まれているかチェック
  if (!projects.some((project) => project.id === Number(projectId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  // smsの削除
  await deleteSmsByProjectId(projectId);
  // smsの更新
  sms.forEach(async (sm) => {
    await createOrUpdateSm(projectId, sm.id, sm);
  });
  return NextResponse.json({ message: "OK" });
}
