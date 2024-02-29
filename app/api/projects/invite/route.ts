import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { inviteUserInvitation } from "@/db/crud/projects";
import { getUserByEmail } from "@/db/crud/user";

export async function POST(req: Request) {
  const { projectId, inviteeEmail, role } = await req.json();
  const session = await getServerSession();
  if (!session) return NextResponse.json([]);
  // inviterIdがusersに含まれているかチェック
  const [invitee] = await getUserByEmail(inviteeEmail);
  if (!invitee) return NextResponse.json({ error: "User not found" }, { status: 404 });
  await inviteUserInvitation({ projectId, inviteeId: invitee.id, role });
  return NextResponse.json({
    message: "OK",
  });
}
