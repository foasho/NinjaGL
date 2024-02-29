import { eq } from "drizzle-orm";

import { db } from "@/db";
import { oms } from "@/db/schema";

import { CreateOrUpdateOMData } from "../types";

export const getOmsByProjectId = async (projectId: number) => {
  const _oms = await db.select().from(oms).where(eq(oms.projectId, projectId));
  // argsをJSON文字列からオブジェクトに変換
  return _oms.map((om) => {
    if (om.args) {
      // @ts-ignore
      om.args = JSON.parse(om.args);
    }
    return om;
  });
};

export const createOrUpdateOm = async (projectId: number, id: string, body: CreateOrUpdateOMData) => {
  // idが存在チェック
  const [om] = await db.select().from(oms).where(eq(oms.id, id)).limit(1);
  // om.argsObjectをJSON文字列に変換
  if (om) {
    const params = { ...body, projectId };
    // update
    const [_om] = await db
      .update(oms)
      .set({
        name: params.name,
        type: params.type,
        filePath: params.filePath,
        visiableType: params.visiableType,
        visible: params.visible,
        layerNum: params.layerNum,
        args: params.args,
        rules: params.rules,
        physics: params.physics,
        moveable: params.moveable,
        phyType: params.phyType,
      })
      .where(eq(oms.id, id))
      .returning();
    return _om;
  } else {
    // create
    const [_om] = await db
      .insert(oms)
      .values({ ...body, projectId })
      .returning();
    return _om;
  }
};

export const deleteOm = async (id: string) => {
  return await db.delete(oms).where(eq(oms.id, id));
};

export const deleteOmsByProjectId = async (projectId: number) => {
  return await db.delete(oms).where(eq(oms.projectId, projectId));
}
