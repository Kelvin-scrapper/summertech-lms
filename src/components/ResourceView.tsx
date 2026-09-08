import { FileText, Presentation, Link2, Paperclip, Video, Download } from 'lucide-react';
import type { Resource } from '@prisma/client';
import { embedSrc, isDirectVideo } from '@/lib/embed';

const icons = { VIDEO: Video, PDF: FileText, SLIDES: Presentation, LINK: Link2, OTHER: Paperclip };

function prettySize(bytes: number | null) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function ResourceView({ resource }: { resource: Resource }) {
  const Icon = icons[resource.kind] ?? Paperclip;
  const embed = embedSrc(resource.url);

  if (resource.kind === 'VIDEO' && (embed || isDirectVideo(resource.url))) {
    return (
      <figure className="overflow-hidden rounded-xl border border-slate-200">
        <div className="aspect-video bg-black">
          {embed ? (
            <iframe
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={resource.title}
            />
          ) : (
            <video src={resource.url} controls className="h-full w-full" />
          )}
        </div>
        <figcaption className="px-4 py-2 text-sm font-medium text-slate-700">{resource.title}</figcaption>
      </figure>
    );
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-800">{resource.title}</span>
        <span className="text-xs text-slate-400">
          {resource.kind}
          {prettySize(resource.sizeBytes) ? ` · ${prettySize(resource.sizeBytes)}` : ''}
        </span>
      </span>
      <Download className="h-4 w-4 shrink-0 text-slate-400" />
    </a>
  );
}
