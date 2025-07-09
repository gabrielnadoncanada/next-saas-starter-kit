import env from '@/lib/env';
import { UpdatePassword } from '@/features/account';
import { ManageSessions } from '@/features/account';

export default function Security() {
  const { sessionStrategy } = env.nextAuth;

  return (
    <div className="flex gap-10 flex-col">
      <UpdatePassword />
      {sessionStrategy === 'database' && <ManageSessions />}
    </div>
  );
}
