import { eq } from "drizzle-orm";

import { db } from "@/db";
import { configs } from "@/db/schema";

import { ConfigData, CreateConfigData, UpdateConfigData } from "../types";

export const getConfigByProjectId = async (projectId: number) => {
  // @ts-ignore
  const [config] = (await db.select().from(configs).where(eq(configs.projectId, projectId)).limit(1)) as ConfigData[];
  return config;
};

export const createConfig = async (body: CreateConfigData) => {
  return await db
    .insert(configs)
    .values({ ...body })
    .returning();
};

export const updateConfig = async (id: number, body: UpdateConfigData) => {
  const [_config] = await db
    .update(configs)
    .set({ ...body })
    .where(eq(configs.id, id))
    .returning();
  return _config;
};
