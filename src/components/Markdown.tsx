import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-7 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => <h2 className="mt-8 mb-2 font-display text-xl font-bold text-slate-900">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 mb-2 font-display text-base font-bold text-slate-900">{children}</h3>,
          p: ({ children }) => <p className="my-3">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="font-medium text-accent-600 underline underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children }) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px]">{children}</code>,
          pre: ({ children }) => <pre className="my-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] text-slate-100">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-600">{children}</blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
