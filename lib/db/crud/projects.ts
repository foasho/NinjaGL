import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { members, projects } from "@/db/schema";

import { CreateProjectData } from "../types";

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

export const createProject = async ({ name, description, publish, userId }: CreateProjectData) => {
  const [project] = await db.insert(projects).values({ name, description, publish }).returning();
  // user_idとmember_idを紐付ける
  await db.insert(members).values({ projectId: project.id, userId });
  return project;
};

export const updateProject = async (id: number, name: string) => {
  return await db.update(projects).set({ name }).where(eq(projects.id, id));
};
