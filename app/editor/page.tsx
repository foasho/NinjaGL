import { Suspense } from "react";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";

import { getConfigByProjectId } from "@/db/crud/config";
import { getMembersByProjectId } from "@/db/crud/members";
import { getOmsByProjectId } from "@/db/crud/oms";
import { getProjectById } from "@/db/crud/projects";
import { getSmsByProjectId } from "@/db/crud/sms";
import { getMergedSessionServer } from "@/middleware";

import { Editor } from "./_editor";
import { CurrentHostUrl } from "@/utils";

type GetProjectData = {
  project: any;
  oms: any[];
  sms: any[];
  config: any;
};
const getProjectData = async (projectId: number) => {
  const response = await fetch(
    `${CurrentHostUrl}/api/projects?id=${projectId}`, 
    { 
      cache: "no-store",
      headers: Object.fromEntries(headers()),
    }
    );
  const project = await response.json();
  return project;
};

type EditorPageProps = {
  searchParams: {
    id?: number;
  };
};
const EditorPage = async ({ searchParams: { id } }: EditorPageProps) => {
  let projectData = {
    project: null,
    oms: [],
    sms: [],
    config: null,
  } as GetProjectData;
  if (id) {
    projectData = (await getProjectData(id)) as GetProjectData;
    if (!projectData) {
      return <div>プロジェクトまたは権限がありません。</div>;
    }
  }

  return (
    <Suspense fallback={null}>
      <Editor projectId={id} initOMs={projectData.oms} initSMs={projectData.sms} initConfig={projectData.config} />
    </Suspense>
  );
};

export default EditorPage;
