import { headers } from "next/headers";

import { CurrentHostUrl } from "@/utils";

import { CreateButton } from "./ui/CreateButton";
import { ProjectsTable } from "./ui/ProjectTable";

const getProjects = async () => {
  try {
    const projects = await fetch(`${CurrentHostUrl}/api/projects`, {
      // next: { revalidate: 3600, tags: ["all", "projects"] },
      cache: "no-store",
      headers: Object.fromEntries(headers()),
    }).then((res) => res.json());
    return projects;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const ProjectsPage = async () => {
  const projects = await getProjects();
  return (
    <div className='px-16 pt-32'>
      <div className='mb-3 flex justify-between'>
        <div className='text-2xl text-white'>Projects</div>
        <CreateButton />
      </div>
      <ProjectsTable projects={projects} />
    </div>
  );
};

export default ProjectsPage;
