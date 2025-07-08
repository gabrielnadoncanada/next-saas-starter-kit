import { generateToken, validateEmail } from '@/lib/server-common';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { ApiError } from '@/lib/errors';
import { recordMetric } from '@/lib/metrics';
import { validateRecaptcha } from '@/lib/recaptcha';
import { getUser } from 'models/user';
import { createPasswordReset } from 'models/passwordReset';
import { forgotPasswordSchema, validateWithSchema } from '@/lib/zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, recaptchaToken } = validateWithSchema(
      forgotPasswordSchema,
      body
    );

    await validateRecaptcha(recaptchaToken);

    if (!email || !validateEmail(email)) {
      throw new ApiError(422, 'The e-mail address you entered is invalid');
    }

    const user = await getUser({ email });

    if (!user) {
      throw new ApiError(422, `We can't find a user with that e-mail address`);
    }

    const resetToken = generateToken();

    await createPasswordReset({
      data: {
        email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
      },
    });

    await sendPasswordResetEmail(user, encodeURIComponent(resetToken));

    recordMetric('user.password.request');

    return NextResponse.json({});
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    return NextResponse.json({ error: { message } }, { status });
  }
}
