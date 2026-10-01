'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Link2,
  ExternalLink,
} from 'lucide-react';
import type { EditableCourse, ResourceKind } from '@/lib/types';
import {
  createModule,
  renameModule,
  deleteModule,
  moveModule,
  createLesson,
  updateLesson,
  deleteLesson,
  moveLesson,
  addResourceLink,
  deleteResource,
} from '@/lib/actions';
import ResourceUploader from './ResourceUploader';

function confirmSubmit(message: string) {
  return (e: React.FormEvent) => {
    if (!window.confirm(message)) e.preventDefault();
  };
}

export default function CourseEditor({ course }: { course: EditableCourse }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {course.modules.map((m, mi) => (
        <div key={m.id} className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-xs font-bold text-slate-400">{mi + 1}</span>
            <form action={renameModule.bind(null, m.id)} className="flex flex-1 items-center gap-2">
              <input
                name="title"
                defaultValue={m.title}
                className="input flex-1 py-1.5 text-sm font-semibold"
                aria-label="Module title"
              />
              <button type="submit" className="btn-ghost px-2 py-1 text-xs">
                Save
              </button>
            </form>
            <form action={moveModule.bind(null, m.id, 'up')}>
              <button className="btn-ghost px-1.5 py-1" aria-label="Move module up" disabled={mi === 0}>
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <form action={moveModule.bind(null, m.id, 'down')}>
              <button
                className="btn-ghost px-1.5 py-1"
                aria-label="Move module down"
                disabled={mi === course.modules.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </form>
            <form action={deleteModule.bind(null, m.id)} onSubmit={confirmSubmit('Delete this module and all its lessons?')}>
              <button className="btn-ghost px-1.5 py-1 text-red-500" aria-label="Delete module">
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>

          <ul className="divide-y divide-slate-100">
            {m.lessons.map((l, li) => {
              const expanded = open === l.id;
              return (
                <li key={l.id}>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2 text-left text-sm"
                      onClick={() => setOpen(expanded ? null : l.id)}
                    >
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                      <span className="font-medium">{l.title}</span>
                      <span className="text-xs text-slate-400">
                        {l.estMinutes}m · {l.resources.length} resource{l.resources.length === 1 ? '' : 's'}
                      </span>
                    </button>
                    <form action={moveLesson.bind(null, l.id, 'up')}>
                      <button className="btn-ghost px-1.5 py-1" aria-label="Move lesson up" disabled={li === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                    </form>
                    <form action={moveLesson.bind(null, l.id, 'down')}>
                      <button
                        className="btn-ghost px-1.5 py-1"
                        aria-label="Move lesson down"
                        disabled={li === m.lessons.length - 1}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </form>
                    <form action={deleteLesson.bind(null, l.id)} onSubmit={confirmSubmit('Delete this lesson?')}>
                      <button className="btn-ghost px-1.5 py-1 text-red-500" aria-label="Delete lesson">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>

                  {expanded ? (
                    <div className="space-y-5 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                      <form action={updateLesson.bind(null, l.id)} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                          <div>
                            <label className="label">Lesson title</label>
                            <input name="title" defaultValue={l.title} className="input" required />
                          </div>
                          <div>
                            <label className="label">Minutes</label>
                            <input name="estMinutes" type="number" min={1} defaultValue={l.estMinutes} className="input" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Notes (Markdown)</label>
                          <textarea
                            name="contentMarkdown"
                            defaultValue={l.contentMarkdown}
                            rows={8}
                            className="input font-mono text-[13px]"
                            placeholder="## Section&#10;Write the lesson notes here…"
                          />
                        </div>
                        <button type="submit" className="btn-primary">
                          Save lesson
                        </button>
                      </form>

                      <div>
                        <p className="label">Resources (video / PDF / slides / link)</p>
                        <ul className="space-y-2">
                          {l.resources.map((r) => (
                            <li
                              key={r.id}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
                                {r.kind}
                              </span>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-slate-700"
                              >
                                <span className="truncate">{r.title}</span>
                                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              </a>
                              <form action={deleteResource.bind(null, r.id)}>
                                <button className="btn-ghost px-1.5 py-1 text-red-500" aria-label="Remove resource">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </form>
                            </li>
                          ))}
                          {l.resources.length === 0 ? (
                            <li className="text-xs text-slate-400">Nothing attached yet.</li>
                          ) : null}
                        </ul>

                        <div className="mt-3 flex flex-wrap items-end gap-3">
                          <form action={addResourceLink.bind(null, l.id)} className="flex flex-wrap items-end gap-2">
                            <div>
                              <label className="label text-xs">Title</label>
                              <input name="title" required className="input py-1.5" placeholder="Intro video" />
                            </div>
                            <div>
                              <label className="label text-xs">URL</label>
                              <input name="url" type="url" required className="input py-1.5" placeholder="https://youtu.be/…" />
                            </div>
                            <select name="kind" className="input w-28 py-1.5" defaultValue={'VIDEO' as ResourceKind}>
                              <option value="VIDEO">Video</option>
                              <option value="PDF">PDF</option>
                              <option value="SLIDES">Slides</option>
                              <option value="LINK">Link</option>
                              <option value="OTHER">Other</option>
                            </select>
                            <button type="submit" className="btn-secondary">
                              <Link2 className="h-4 w-4" /> Add link
                            </button>
                          </form>
                          <ResourceUploader lessonId={l.id} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
            {m.lessons.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400">No lessons yet.</li>
            ) : null}
          </ul>

          <form action={createLesson.bind(null, m.id)} className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
            <input name="title" required placeholder="New lesson title" className="input flex-1 py-1.5 text-sm" />
            <button type="submit" className="btn-secondary">
              <Plus className="h-4 w-4" /> Add lesson
            </button>
          </form>
        </div>
      ))}

      <form action={createModule.bind(null, course.id)} className="card flex items-center gap-2 p-4">
        <input name="title" required placeholder="New module title" className="input flex-1" />
        <button type="submit" className="btn-primary">
          <Plus className="h-4 w-4" /> Add module
        </button>
      </form>
    </div>
  );
}
