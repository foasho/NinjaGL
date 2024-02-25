import { eq } from "drizzle-orm";

import { db } from "@/db";
import { configs } from "@/db/schema";

import { ConfigData, CreateConfigData } from "../types";

export const getConfigByProjectId = async (projectId: number) => {
  // @ts-ignore
  const [config] = (await db.select().from(configs).where(eq(configs.projectId, projectId)).limit(1)) as ConfigData[];
  return config;
};

export const createOrUpdateConfig = async (projectId: number, body: CreateConfigData) => {
  // idが存在チェック
  const [config] = await db.select().from(configs).where(eq(configs.projectId, projectId)).limit(1);
  if (config) {
    // update
    const [_config] = await db
      .update(configs)
      .set({ ...body })
      .where(eq(configs.projectId, projectId))
      .returning();
    return _config;
  } else {
    // create
    const [_config] = await db
      .insert(configs)
      .values({ ...body, projectId })
      .returning();
    return _config;
  }
};
