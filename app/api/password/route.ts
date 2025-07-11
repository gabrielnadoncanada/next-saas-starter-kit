import { hashPassword, verifyPassword } from '@/lib/auth-utils';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/errors';
import { recordMetric } from '@/lib/metrics';
import { cookies } from 'next/headers';
import { sessionTokenCookieName } from '@/lib/nextAuth';
import env from '@/lib/env';
import { findFirstUserOrThrow, updateUser } from '@/shared/model/user';
import { deleteManySessions } from '@/shared/model/session';
import { validateWithSchema, updatePasswordSchema } from '@/lib/zod';

export async function PUT(request: NextRequest) {
  try {
    // For App Router, we need to adapt session handling
    const session = await getSession(request as any, {} as any);

    const { currentPassword, newPassword } = validateWithSchema(
      updatePasswordSchema,
      await request.json()
    );

    const user = await findFirstUserOrThrow({
      where: { id: session?.user.id },
    });

    if (!(await verifyPassword(currentPassword, user.password as string))) {
      throw new ApiError(400, 'Your current password is incorrect');
    }

    await updateUser({
      where: { id: session?.user.id },
      data: { password: await hashPassword(newPassword) },
    });

    // Remove all sessions other than the current one
    if (env.nextAuth.sessionStrategy === 'database') {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(sessionTokenCookieName)?.value;

      await deleteManySessions({
        where: {
          userId: session?.user.id,
          NOT: {
            sessionToken,
          },
        },
      });
    }

    recordMetric('user.password.updated');

    return NextResponse.json({ data: {} });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
