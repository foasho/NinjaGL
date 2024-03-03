import { and, eq, inArray, like } from "drizzle-orm";

import { db } from "@/db";
import { members, projects } from "@/db/schema";

import { CreateProjectData, InviteProjectData, UpdateProjectData } from "../types";

export const getProjectById = async (id: number) => {
  return await db.select().from(projects).where(eq(projects.id, id)).limit(1);
};

export const getProjectsByUserId = async (userId: number) => {
  // membersテーブルにprojectIdとuserIdが紐づいているので、userIdで検索する
  const dbMembers = await db.select().from(members).where(eq(members.userId, userId));
  // membersテーブルのprojectIdを元にprojectsテーブルを検索する
  const projectIds = dbMembers.map((member) => member.projectId).filter((id) => id !== null) as number[];
  if (projectIds.length === 0) return [];
  return await db.select().from(projects).where(inArray(projects.id, projectIds));
};

// 公開中のプロジェクトを取得する
export const getPublishedProjects = async (q?: string) => {
  if (q) {
    return await db
      .select()
      .from(projects)
      .where(and(eq(projects.publish, true), like(projects.name, `%${q}%`)));
  }
  return await db.select().from(projects).where(eq(projects.publish, true));
};

export const createProject = async ({ name, description, publish, userId, image }: CreateProjectData) => {
  const [project] = await db.insert(projects).values({ name, description, publish, image }).returning();
  // user_idとmember_idを紐付ける
  await db.insert(members).values({ projectId: project.id, userId });
  return project;
};

export const updateProject = async (id: number, { description, publish, image, preview }: UpdateProjectData) => {
  // undefinedの場合は更新しない
  const body = { description, publish, image, preview };
  const keys = Object.keys(body);
  keys.forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });
  console.log(body);
  return await db.update(projects).set(
    { ...body },
  ).where(eq(projects.id, id));
};

/**
 * Projectにユーザーを招待する
 */
export const inviteUserInvitation = async (body: InviteProjectData) => {
  return await db.insert(members).values({ ...body, userId: body.inviteeId });
};
