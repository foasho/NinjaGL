import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getConfigByProjectId } from "@/db/crud/config";
import { getMembersByProjectId } from "@/db/crud/members";
import { getOmsByProjectId } from "@/db/crud/oms";
import { getProjectById, getProjectsByUserId } from "@/db/crud/projects";
import { getSmsByProjectId } from "@/db/crud/sms";
import { getMergedSessionServer } from "@/middleware";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const { searchParams } = new URL(req.url);
  if (searchParams.get("id")) {
    const projectId = Number(searchParams.get("id"));
    const [project] = await getProjectById(projectId);
    if (!project) return;
    if (!project.publish) {
      const members = await getMembersByProjectId(projectId);
      // プロジェクトのメンバーでない場合はプレビューできない
      if (!members.some((member) => member.userId === session.user.id)) return;
    }
    // projectから必要なデータを取得する
    const oms = await getOmsByProjectId(projectId);
    const sms = await getSmsByProjectId(projectId);
    const config = await getConfigByProjectId(projectId);
    return NextResponse.json({ project, oms, sms, config });
  }
  const projects = await getProjectsByUserId(mergedSession.user.id);
  return NextResponse.json(projects);
}
