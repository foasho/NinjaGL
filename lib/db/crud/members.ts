import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { members } from "@/db/schema";

import { CreateMemberData } from "../types";

export const getMembersByProjectId = async (projectId: number) => {
  return await db.select().from(members).where(eq(members.projectId, projectId));
};

export const getMembersByUserId = async (userId: number) => {
  return await db.select().from(members).where(eq(members.userId, userId));
};

export const createMember = async ({ projectId, userId, role }: CreateMemberData) => {
  return await db.insert(members).values({ projectId, userId, role }).returning();
};



