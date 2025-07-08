'use client';

import { LetterAvatar } from '@/components/shared';
import { useRouter } from 'next/navigation';

interface Connection {
  clientID: string;
  name: string;
}

interface IdPSelectionClientProps {
  connections: Connection[];
  searchParams: {
    [key: string]: string | undefined;
  };
}

export default function IdPSelectionClient({
  connections,
  searchParams,
}: IdPSelectionClientProps) {
  const router = useRouter();

  const connectionSelected = (clientID: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set('idp_hint', clientID);

    const currentPath = '/auth/sso/idp-select';
    return router.push(`${currentPath}?${params.toString()}`);
  };

  return (
    <div className="rounded p-6 border">
      <div className="flex flex-col gap-4">
        {connections.map((connection) => {
          return (
            <button
              type="button"
              className="w-full btn btn-outline justify-start"
              onClick={() => {
                connectionSelected(connection.clientID);
              }}
              key={connection.clientID}
            >
              <div className="flex gap-2 text-left items-center">
                {connection.name && <LetterAvatar name={connection.name} />}
                <div>{connection.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
