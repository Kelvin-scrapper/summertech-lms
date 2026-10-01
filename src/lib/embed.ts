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
