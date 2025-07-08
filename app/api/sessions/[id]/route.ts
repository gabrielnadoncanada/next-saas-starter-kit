import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { deleteSession, findFirstSessionOrThrown } from 'models/session';
import { validateWithSchema, deleteSessionSchema } from '@/lib/zod';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = validateWithSchema(deleteSessionSchema, await params);

    // For App Router, we need to adapt session handling
    const session = await getSession(request as any, {} as any);

    await findFirstSessionOrThrown({
      where: {
        id,
        userId: session?.user.id,
      },
    });

    await deleteSession({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
