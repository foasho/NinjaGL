import { getServerSession } from "next-auth";

import { getMembersByProjectId } from "@/db/crud/members";
import { getOmsByProjectId } from "@/db/crud/oms";
import { getProjectById } from "@/db/crud/projects";
import { getMergedSessionServer } from "@/middleware";

const getProjectData = async (projectId: number) => {
  const [project] = await getProjectById(projectId);
  if (!project) return;
  if (!project.publish) {
    const session = await getServerSession();
    if (!session) return;
    const { user } = await getMergedSessionServer(session);
    const members = await getMembersByProjectId(projectId);
    // プロジェクトのメンバーでない場合はプレビューできない
    if (!members.some((member) => member.userId === user.id)) return;
  }
  // projectから必要なデータを取得する
  const oms = await getOmsByProjectId(projectId);
  // const sms = 
  // const config = 
};

type PreviewPageProps = {
  searchParams: {
    projectId: number;
  };
};
const PreviewPage = async ({ searchParams }: PreviewPageProps) => {
  return <div>{searchParams.projectId && <p>Project ID: {searchParams.projectId}</p>}</div>;
};

export default PreviewPage;
