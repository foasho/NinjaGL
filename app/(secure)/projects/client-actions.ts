"use client";

import { Session } from "next-auth";

import { CreateProjectData, InviteProjectClient } from "@/db/types";

export const createProjectAction = async (session: Session, project: FormData) => {
  const rawProjectData = {
    name: project.get("name"),
    description: project.get("description"),
    publish: project.get("publish") === "true",
    userId: session?.user.id!,
  } as CreateProjectData;

  await fetch("/api/projects", {
    method: "POST",
    body: JSON.stringify(rawProjectData),
  });
};

export const inviteUserInvitationAction = async (session: Session, form: FormData) => {
  const rawInvitationData = {
    projectId: Number(form.get("projectId")),
    inviteeEmail: form.get("email"),
    role: "owner",
  } as InviteProjectClient;

  await fetch("/api/projects/invite", {
    method: "POST",
    body: JSON.stringify(rawInvitationData),
  });
};
