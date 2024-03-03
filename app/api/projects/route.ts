import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getConfigByProjectId } from "@/db/crud/config";
import { getMembersByProjectId } from "@/db/crud/members";
import { getOmsByProjectId } from "@/db/crud/oms";
import { createProject, getProjectById, getProjectsByUserId, updateProject } from "@/db/crud/projects";
import { deleteSmsById, getSmsByProjectId } from "@/db/crud/sms";
import { getMergedSessionServer } from "@/middleware";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const { searchParams } = new URL(req.url);
  if (searchParams.get("id")) {
    const projectId = Number(searchParams.get("id"));
    const [project] = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
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

export async function POST(req: Request) {
  const { name, description, publish, userId, image } = await req.json();
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  if (mergedSession.user.id !== userId) return NextResponse.json([]);
  const project = await createProject({ name, description, publish, userId, image });
  return NextResponse.json(project);
}

export async function PUT(req: Request) {
  const { projectId, name, description, publish, image, preview } = await req.json();
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const projects = await getProjectsByUserId(mergedSession.user.id);
  // projectIdがprojectsに含まれているかチェック
  if (!projects.some((project) => project.id === Number(projectId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const project = await updateProject(projectId, { name, description, publish, image, preview });
  return NextResponse.json(project);
}

export async function DELETE(req: Request) {
  const { projectId, smId } = await req.json();
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  const mergedSession = await getMergedSessionServer(session);
  const projects = await getProjectsByUserId(mergedSession.user.id);
  // projectIdがprojectsに含まれているかチェック
  if (!projects.some((project) => project.id === Number(projectId))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  // smsの削除
  await deleteSmsById(smId);
  return NextResponse.json({ message: "OK" });
}
