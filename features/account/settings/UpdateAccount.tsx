'use client';

import type { User } from '@prisma/client';
import { UpdateName } from '@/features/account/profile/UpdateName';
import { UpdateEmail } from '@/features/account/profile/UpdateEmail';
import UploadAvatar from '@/components/account/UploadAvatar';
import UpdateTheme from '@/components/account/UpdateTheme';
import env from '@/lib/env';

interface UpdateAccountProps {
  user: Partial<User>;
  allowEmailChange: boolean;
}

export function UpdateAccount({ user, allowEmailChange }: UpdateAccountProps) {
  return (
    <div className="flex gap-6 flex-col">
      <UpdateName name={user.name || ''} />
      <UpdateEmail user={user} allowEmailChange={allowEmailChange} />
      <UploadAvatar user={user} />
      {env.darkModeEnabled && <UpdateTheme />}
    </div>
  );
}
