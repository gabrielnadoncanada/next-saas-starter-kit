import { getUser } from '@/shared/model/user';
import { ApiError } from '@/lib/errors';
import { deleteVerificationToken } from '@/features/auth/shared/model/verificationToken';
import { isAccountLocked, sendLockoutEmail } from '@/lib/accountLock';
import { resendLinkRequestSchema, validateWithSchema } from '@/lib/zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, expiredToken } = validateWithSchema(
      resendLinkRequestSchema,
      body
    );

    const user = await getUser({ email });

    if (!user) {
      throw new ApiError(400, 'User not found');
    }

    if (!isAccountLocked(user)) {
      throw new ApiError(
        400,
        'Your account is already active. Please try logging in.'
      );
    }

    await deleteVerificationToken(expiredToken);
    await sendLockoutEmail(user, true);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
