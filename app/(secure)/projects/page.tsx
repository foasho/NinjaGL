import { headers } from "next/headers";

import { CreateButton } from "./_create";
import { ProjectsTable } from "./_table";

const getProjects = async () => {
  const projects = await fetch(`${process.env.NEXTAUTH_URL}/api/projects`, {
    // next: { revalidate: 3600, tags: ["all", "projects"] },
    cache: "no-store",
    headers: Object.fromEntries(headers()),
  }).then((res) => res.json());
  return projects;
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
