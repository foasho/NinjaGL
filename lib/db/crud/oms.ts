import { eq } from "drizzle-orm";

import { db } from "@/db";
import { oms } from "@/db/schema";

import { CreateOrUpdateOMData } from "../types";

export const getOmsByProjectId = async (projectId: number) => {
  return await db.select().from(oms).where(eq(oms.projectId, projectId));
};

export const createOrUpdateOm = async (project_id: number, id: string, body: CreateOrUpdateOMData) => {
  // idが存在チェック
  const [om] = await db.select().from(oms).where(eq(oms.id, id)).limit(1);
  if (om) {
    // update
    const [_om] = await db
      .update(oms)
      .set({ ...body })
      .where(eq(oms.id, id))
      .returning();
    return _om;
  } else {
    // create
    const [_om] = await db
      .insert(oms)
      .values({ ...body })
      .returning();
    return _om;
  }
};
