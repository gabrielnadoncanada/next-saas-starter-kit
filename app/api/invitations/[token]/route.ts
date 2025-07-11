import {
  getInvitation,
  isInvitationExpired,
} from '@/features/invitation/shared/model/invitation';
import { NextRequest, NextResponse } from 'next/server';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import { getInvitationSchema, validateWithSchema } from '@/lib/zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = validateWithSchema(getInvitationSchema, await params);

    const invitation = await getInvitation({ token });

    if (await isInvitationExpired(invitation.expires)) {
      throw new ApiError(400, 'Invitation expired. Please request a new one.');
    }

    recordMetric('invitation.fetched');

    return NextResponse.json({ data: invitation });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: { message: error.message },
      },
      { status: 400 }
    );
  }
}
