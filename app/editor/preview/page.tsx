import { getServerSession } from "next-auth";

import { getConfigByProjectId } from "@/db/crud/config";
import { getMembersByProjectId } from "@/db/crud/members";
import { getOmsByProjectId } from "@/db/crud/oms";
import { getProjectById } from "@/db/crud/projects";
import { getSmsByProjectId } from "@/db/crud/sms";
import { getMergedSessionServer } from "@/middleware";

import { PreviewNinjaGL } from "./_preview";

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
  const sms = await getSmsByProjectId(projectId);
  const config = await getConfigByProjectId(projectId);
  return { project, oms, sms, config };
};

type PreviewPageProps = {
  searchParams: {
    projectId: number;
  };
};
const PreviewPage = async ({ searchParams }: PreviewPageProps) => {
  const projectData = await getProjectData(searchParams.projectId);

  if (!projectData) {
    return <div>プレビューできません</div>;
  }

  const { project, oms, sms, config } = projectData;

  return <div>{project && <PreviewNinjaGL oms={oms} sms={sms} config={config} />}</div>;
};

export default PreviewPage;
