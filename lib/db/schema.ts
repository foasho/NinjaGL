import { OMArgsProps, OMPhysicsType, OMType, OMVisibleType } from "@ninjagl/core";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  physics: boolean("physics").notNull().default(true),
  multi: boolean("multi").notNull().default(true),
  isApi: boolean("is_api").notNull().default(true),
  isDebug: boolean("is_debug").notNull().default(false),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  publish: boolean("publish").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// projecsとusersの中間テーブル
export type RoleProps = "owner" | "viewer";
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull().$type<RoleProps>().default("owner"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const oms = pgTable("oms", {
  projectId: integer("project_id").notNull().references(() => projects.id),
  // 以下はOMのプロパティ
  id: text("id").notNull(), // IDはプロジェクト側でUUID生成される
  name: text("name"),
  type: text("type").notNull().$type<OMType>(),
  filePath: text("file_path"),
  visiableType: text("visiable_type").$type<OMVisibleType>().default("auto"),
  visible: boolean("visible").notNull().default(true),
  layerNum: integer("layer_num"),
  args: text("args").$type<OMArgsProps>(),
  rules: text("rules"),
  physics: boolean("physics").notNull().default(true),
  moveable: boolean("moveable"),
  phyType: text("phy_type").notNull().$type<OMPhysicsType>().default("box"),
});

export const sms = pgTable("sms", {
  projectId: integer("project_id").references(() => projects.id),
  // 以下はSMのプロパティ
  id: text("id").notNull(), // IDはプロジェクト側でUUID生成される
  type: text("type").notNull(),
  name: text("name").notNull(),
  script: text("script").notNull(),
});
