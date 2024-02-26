"use server";
import { revalidateTag } from "next/cache";
import { throttle } from "lodash-es";
import { getServerSession } from "next-auth";

import { createProject, inviteUserInvitation } from "@/db/crud/projects";
import { getUserByEmail } from "@/db/crud/user";
import { CreateProjectData, InviteProjectData } from "@/db/types";
import { getMergedSessionServer } from "@/middleware";

const _createProjectAction = async (project: FormData) => {
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
export const createProjectAction = throttle(_createProjectAction, 1000);

const _inviteUserInvitationAction = async (form: FormData) => {
  const session = await getServerSession();
  if (!session) return;
  const [user] = await getUserByEmail(form.get("email") as string);
  if (!user) return;

  const rawInvitationData = {
    projectId: Number(form.get("projectId")),
    inviterId: Number(user.id),
    role: "owner",
  } as InviteProjectData;

  await inviteUserInvitation(rawInvitationData);
  revalidateTag("projects");
};
export const inviteUserInvitationAction = throttle(_inviteUserInvitationAction, 1000);
