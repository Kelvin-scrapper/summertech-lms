import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

// The browser can't see the httpOnly session token, so uploads come through
// here and are forwarded to the API with it.
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }

  const lessonId = String(form.get('lessonId') ?? '');
  const file = form.get('file');
  if (!lessonId || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file or lesson.' }, { status: 400 });
  }

  const body = new FormData();
  body.set('file', file, file.name);
  body.set('title', String(form.get('title') ?? file.name));

  try {
    const resource = await api(`/teach/lessons/${encodeURIComponent(lessonId)}/resources/upload`, { method: 'POST', body });
    return NextResponse.json({ ok: true, resource });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
