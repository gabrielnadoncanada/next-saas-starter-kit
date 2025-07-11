import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { ApiError } from '@/lib/errors';
import { getUser } from '@/shared/model/user';
import { createVerificationToken } from '@/features/auth/shared/model/verificationToken';
import { resendEmailToken, validateWithSchema } from '@/lib/zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = validateWithSchema(resendEmailToken, body);

    const user = await getUser({ email });

    if (!user) {
      throw new ApiError(422, `We can't find a user with that e-mail address`);
    }

    const newVerificationToken = await createVerificationToken({
      identifier: email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours),
    });

    await sendVerificationEmail({
      user,
      verificationToken: newVerificationToken,
    });

    return NextResponse.json({});
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
