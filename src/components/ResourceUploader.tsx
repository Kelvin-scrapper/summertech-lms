'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';

export default function ResourceUploader({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFile(file: File) {
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.set('file', file);
      fd.set('lessonId', lessonId);
      fd.set('title', file.name);
      const res = await fetch('/api/teach/upload', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Upload failed.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn-secondary"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="h-4 w-4" />
        {busy ? 'Uploading…' : 'Upload file'}
      </button>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="video/*,application/pdf,.ppt,.pptx,.key,.odp"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
