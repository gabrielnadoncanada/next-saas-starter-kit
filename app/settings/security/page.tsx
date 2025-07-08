import env from '@/lib/env';
import { UpdatePassword } from '@/components/account';
import ManageSessions from '@/components/account/ManageSessions';

export default function Security() {
  const { sessionStrategy } = env.nextAuth;

  return (
    <div className="flex gap-10 flex-col">
      <UpdatePassword />
      {sessionStrategy === 'database' && <ManageSessions />}
    </div>
  );
}
