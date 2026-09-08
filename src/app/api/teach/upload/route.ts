import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, teachesCourse } from '@/lib/auth';
import { guessKind } from '@/lib/embed';

const MAX_BYTES = 200 * 1024 * 1024; // 200 MB

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'File upload is not configured. Set BLOB_READ_WRITE_TOKEN, or attach the resource by URL instead.' },
      { status: 501 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }

  const file = form.get('file');
  const lessonId = String(form.get('lessonId') ?? '');
  const title = String(form.get('title') ?? '').trim();

  if (!(file instanceof File) || !lessonId) {
    return NextResponse.json({ error: 'Missing file or lesson.' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is larger than 200 MB.' }, { status: 413 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
  if (!(await teachesCourse(user.id, lesson.module.courseId))) {
    return NextResponse.json({ error: 'Not your course.' }, { status: 403 });
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const blob = await put(`lessons/${lessonId}/${Date.now()}-${safeName}`, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  const count = await prisma.resource.count({ where: { lessonId } });
  const resource = await prisma.resource.create({
    data: {
      lessonId,
      title: title || file.name,
      url: blob.url,
      kind: guessKind(file.name),
      sizeBytes: file.size,
      order: count,
    },
  });

  return NextResponse.json({ ok: true, resource });
}
