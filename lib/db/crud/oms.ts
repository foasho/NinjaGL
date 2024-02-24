import { eq } from "drizzle-orm";

import { db } from "@/db";
import { oms } from "@/db/schema";

import { CreateOrUpdateOMData, OMData } from "../types";

export const getOmsByProjectId = async (projectId: number) => {
  // @ts-ignore
  const oms = (await db.select().from(oms).where(eq(oms.projectId, projectId))) as OMData[];
  return oms;
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
