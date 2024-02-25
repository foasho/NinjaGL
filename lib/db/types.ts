/**
 * DBで扱うときの型を定義
 */
import type { IConfigParams, IObjectManagement, IScriptManagement, OMArgsProps, OMPhysicsType, OMType, OMVisibleType } from "@ninjagl/core";

/**
 * Project
 */
export type ProjectData = {
  id: number;
  name: string;
  description: string | null;
  publish: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CreateProjectData = {
  name: string;
  description?: string;
  publish: boolean;
  userId: number;
};


/**
 * Member
 */
export type MemberData = {
  id: number;
  projectId: number;
  userId: number;
  role: "owner" | "viewer";
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CreateMemberData = {
  projectId: number;
  userId: number;
  role: "owner" | "viewer";
};

/**
 * OM
 */
export type OMData = {
  projectId: number;
} & IObjectManagement;

export type CreateOrUpdateOMData = {
  projectId: number;
  id: string;
  name?: string;
  type: OMType;
  filePath?: string;
  visiableType?: OMVisibleType;
  visible: boolean;
  layerNum?: number;
  args?: OMArgsProps;
  rules?: string;
  physics: boolean;
  moveable?: boolean;
  phyType: OMPhysicsType;
};

/**
 * SM
 */
export type SMData = {
  projectId: number;
} & IScriptManagement;

export type CreateOrUpdateSMData = {
  projectId: number;
  id: string;
  type: string;
  name: string;
  script: string;
};

/**
 * Config
 */
export type ConfigData = {
  id: number;
  projectId: number;
} & IConfigParams;

export type CreateConfigData = {
  projectId: number;
} & IConfigParams;

export type UpdateConfigData = {
  physics?: boolean;
  multi?: boolean;
  isApi?: boolean;
  isDebug?: boolean;
};
