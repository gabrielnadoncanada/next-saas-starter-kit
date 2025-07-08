'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function SignInButton() {
  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Sign In
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
}

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded">
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span>Welcome, {session.user?.name || session.user?.email}</span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}
