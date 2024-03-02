import { getPublishedProjects } from "@/db/crud/projects";

import { SearchInput } from "./ui/SearchInput";
import { ShowcaseCards } from "./ui/ShowcaseCards";

const getProjects = async (search: string | undefined) => {
  return await getPublishedProjects(search);
};

type Props = {
  searchParams: {
    search?: string;
  };
};
const Page = async ({ searchParams: { search } }: Props) => {
  const projects = await getProjects(search);

  return (
    <div className='container mx-auto px-4 pt-24 sm:px-0'>
      <h1 className="py-4 text-white">Gallery</h1>
      <SearchInput search={search} />
      <ShowcaseCards projects={projects} />
    </div>
  );
};

export default Page;
