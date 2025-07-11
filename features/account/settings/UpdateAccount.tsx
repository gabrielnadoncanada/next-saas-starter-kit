'use client';

import type { User } from '@prisma/client';
import { UpdateName } from '@/features/account/profile/UpdateName';
import { UpdateEmail } from '@/features/account/profile/UpdateEmail';
import { UpdatePassword } from '@/features/account/security/UpdatePassword';
import { ManageSessions } from '@/features/account/security/ManageSessions';
import UploadAvatar from '@/components/account/UploadAvatar';
import UpdateTheme from '@/components/account/UpdateTheme';
import env from '@/lib/env';

interface UpdateAccountProps {
  user: User;
  allowEmailChange: boolean;
}

export function UpdateAccount({ user, allowEmailChange }: UpdateAccountProps) {
  return (
    <div className="flex gap-6 flex-col">
      <UpdateName user={user} />
      <UpdateEmail user={user} allowEmailChange={allowEmailChange} />
      <UpdatePassword />
      {env.nextAuth.sessionStrategy === 'database' && <ManageSessions />}
      <UploadAvatar user={user} />
      {env.darkModeEnabled && <UpdateTheme />}
    </div>
  );
}
