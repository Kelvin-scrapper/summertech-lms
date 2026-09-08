import type { ResourceKind } from '@prisma/client';

/** Turn a resource URL into an <iframe> src if it's an embeddable video, else null. */
export function embedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === 'drive.google.com' && u.pathname.includes('/file/')) {
      return url.replace(/\/view.*$/, '/preview');
    }
    if (host === 'loom.com' && u.pathname.startsWith('/share/')) {
      return url.replace('/share/', '/embed/');
    }
  } catch {
    /* not a URL */
  }
  return null;
}

export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function iconForKind(kind: ResourceKind): string {
  switch (kind) {
    case 'VIDEO':
      return 'video';
    case 'PDF':
      return 'file-text';
    case 'SLIDES':
      return 'presentation';
    case 'LINK':
      return 'link';
    default:
      return 'paperclip';
  }
}

export function guessKind(filename: string): ResourceKind {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'webm', 'mov', 'ogg', 'm4v'].includes(ext)) return 'VIDEO';
  if (ext === 'pdf') return 'PDF';
  if (['ppt', 'pptx', 'key', 'odp'].includes(ext)) return 'SLIDES';
  return 'OTHER';
}
