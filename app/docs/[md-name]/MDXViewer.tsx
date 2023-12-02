'use client';
import ReactMarkdown from 'react-markdown';

export const MDViewer = ({ markdownString }: { markdownString: string }) => {
  return <ReactMarkdown>{markdownString}</ReactMarkdown>;
};
