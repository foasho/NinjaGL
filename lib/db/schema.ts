import { OMArgsProps, OMPhysicsType, OMType, OMVisibleType } from "@ninjagl/core";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  projectName: text("projectName").notNull(),
  dpr: integer("dpr").notNull(),
  multi: boolean("multi").notNull().default(true),
  isApi: boolean("isApi").notNull().default(true),
  isDebug: boolean("isDebug").notNull().default(false),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  config_id: integer("config_id").references(() => configs.id),
  publish: boolean("publish").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

// projecsとusersの中間テーブル
type RoleProps = "owner" | "viewer";
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id),
  user_id: integer("user_id").references(() => users.id),
  role: text("role").notNull().$type<RoleProps>().default("owner"),
  createdAt: timestamp("createdAt", { mode: "date" }),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const oms = pgTable("oms", {
  project_id: integer("project_id").references(() => projects.id),
  // 以下はOMのプロパティ
  id: text("id").notNull(), // IDはプロジェクト側でUUID生成される
  name: text("name"),
  type: text("type").notNull().$type<OMType>(),
  filePath: text("filePath"),
  visiableType: text("visiableType").$type<OMVisibleType>().default("auto"),
  visible: boolean("visible").notNull().default(true),
  layerNum: integer("layerNum"),
  args: text("args").$type<OMArgsProps>(),
  rules: text("rules"),
  physics: boolean("physics").notNull().default(true),
  moveable: boolean("moveable"),
  phyType: text("phyType").notNull().$type<OMPhysicsType>().default("box"),
});

export const sms = pgTable("sms", {
  project_id: integer("project_id").references(() => projects.id),
  // 以下はSMのプロパティ
  id: text("id").notNull(), // IDはプロジェクト側でUUID生成される
  type: text("type").notNull(),
  name: text("name").notNull(),
  script: text("script").notNull(),
});
