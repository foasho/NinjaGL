"use server";

import { getPublishedProjects } from "@/db/crud/projects";
import { Input } from "@nextui-org/input";

const getProjects = async (q: string | undefined) => {
  return await getPublishedProjects(q);
};

// searchParams.get("q")
type Props = {
  searchParams: {
    q?: string;
  };
};
const Page = async ({
  searchParams: { q },
}: Props) => {

  const projects = await getProjects(q);

  return (
    <div>
      <h1>Page</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const q = formData.get("q");
          // ページ遷移
          // router.push(`/page?q=${q}`);
        }}
      >
        <Input size="lg" fullWidth placeholder="Search..."/>
      </form>
    </div>
  );
}

export default Page;