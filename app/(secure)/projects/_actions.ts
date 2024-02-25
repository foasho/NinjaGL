"use server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";

import { createProject } from "@/db/crud/projects";
import { CreateProjectData } from "@/db/types";
import { getMergedSessionServer } from "@/middleware";

export const createProjectAction = async (project: FormData) => {
  const session = await getServerSession();
  if (!session) return;
  const { user } = await getMergedSessionServer(session);

  const rawProjectData = {
    name: project.get("name"),
    description: project.get("description"),
    publish: project.get("publish") === "true",
    userId: user.id,
  } as CreateProjectData;

  await createProject(rawProjectData);

  // 再取得
  revalidateTag("projects");
};
