"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-serif font-bold text-lg mt-3 mb-1.5 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif font-bold text-base mt-3 mb-1.5 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif font-bold text-sm mt-2 mb-1 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-1.5 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-1.5 space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="px-1 py-0.5 rounded bg-nile/10 dark:bg-nile-light/40 text-[0.9em] font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 p-3 rounded-lg bg-nile text-sand dark:bg-nile-light/60 dark:text-sand text-xs overflow-x-auto [&>code]:bg-transparent [&>code]:px-0 [&>code]:py-0 [&>code]:text-[0.85em] [&>code]:text-sand dark:[&>code]:text-sand">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold/60 pl-3 my-2 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-sand/60 dark:border-nile-light/40" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-sand/40 dark:bg-nile-light/30">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left font-semibold border border-sand/50 dark:border-nile-light/40">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 border border-sand/50 dark:border-nile-light/40 align-top">
      {children}
    </td>
  ),
  input: ({ checked }) => (
    <input type="checkbox" checked={!!checked} readOnly disabled className="mr-1.5" />
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
