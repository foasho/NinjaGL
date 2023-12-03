import { Preview } from './Preview';

const getMarkdown = async (mdName: string) => {
  const filePath = `${process.env.NEXTAUTH_URL}/docs/${mdName}.md`;
  const res = await fetch(filePath);
  const markdown = await res.text();
  return markdown;
};

const DocsPage = async ({ params }) => {
  const { mdName } = params;
  const markdown = await getMarkdown(mdName);
  return (
    <div>
      <Preview markdown={markdown} />
    </div>
  );
};

export default DocsPage;
