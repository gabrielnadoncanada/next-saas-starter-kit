import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { getUser, updateUser } from 'models/user';
import { isEmailAllowed } from '@/lib/email/utils';
import { updateAccountSchema, validateWithSchema } from '@/lib/zod';

export async function PUT(request: NextRequest) {
  try {
    const data = validateWithSchema(updateAccountSchema, await request.json());

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if ('email' in data) {
      const allowEmailChange = env.confirmEmail === false;

      if (!allowEmailChange) {
        throw new ApiError(400, 'Email change is not allowed.');
      }

      if (!isEmailAllowed(data.email)) {
        throw new ApiError(400, 'Please use your work email.');
      }

      const user = await getUser({ email: data.email });

      if (user && user.id !== session.user.id) {
        throw new ApiError(400, 'Email already in use.');
      }
    }

    await updateUser({
      where: { id: session.user.id },
      data,
    });

    recordMetric('user.updated');

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
