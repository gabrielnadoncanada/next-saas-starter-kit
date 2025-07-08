'use client';

import React from 'react';
import { AccountLayout } from '@/components/layouts';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  return (
    <AccountLayout>
      <div className="w-full items-center justify-center lg:px-2 xl:px-0 text-center dark:bg-black">
        <p className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider dark:text-gray-300">
          500
        </p>
        <p className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider dark:text-gray-300 mt-2">
          Internal Server Error
        </p>
        <p className="text-lg md:text-xl lg:text-2xl dark:text-gray-500 my-12">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="mt-8 space-x-5">
          <button
            onClick={() => reset()}
            className="btn btn-primary btn-md py-3 px-2 sm:px-4 text-white"
          >
            Try Again
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className="btn btn-primary dark:border-zinc-600 dark:border-2 dark:text-zinc-200 btn-outline py-3 px-2 sm:px-4 btn-md"
          >
            Go Back
          </button>
        </div>
        <p className="text-lg md:text-xl lg:text-2xl dark:text-gray-500 my-12">
          If the problem persists, please contact support.
        </p>
      </div>
    </AccountLayout>
  );
}
