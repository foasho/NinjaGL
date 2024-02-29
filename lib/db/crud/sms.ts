import { eq } from "drizzle-orm";

import { db } from "@/db";
import { sms } from "@/db/schema";

import { CreateOrUpdateSMData, SMData } from "../types";

export const getSmsByProjectId = async (projectId: number) => {
  // @ts-ignore
  return (await db.select().from(sms).where(eq(sms.projectId, projectId))) as SMData[];
};

export const createOrUpdateSm = async (projectId: number, id: string, body: CreateOrUpdateSMData) => {
  // idが存在チェック
  const [sm] = await db.select().from(sms).where(eq(sms.id, id)).limit(1);
  if (sm) {
    // update
    const [_sm] = await db
      .update(sms)
      .set({ ...body, projectId })
      .where(eq(sms.id, id))
      .returning();
    return _sm;
  } else {
    // create
    const [_sm] = await db
      .insert(sms)
      .values({ ...body, projectId })
      .returning();
    return _sm;
  }
};

export const deleteSmsByProjectId = async (projectId: number) => {
  return await db.delete(sms).where(eq(sms.projectId, projectId));
}
