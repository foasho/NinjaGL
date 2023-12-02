import { MDViewer } from './MDXViewer';

const getMarkdown = async (mdName: string) => {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/docs/${mdName}.md`);
  return res.text();
};

const DocsPage = async ({ params }) => {

  const { mdName } = params;
  const markdownString = await getMarkdown(mdName);

  return (
    <div>
      <MDViewer markdownString={markdownString} />
    </div>
  );
}

export default DocsPage;