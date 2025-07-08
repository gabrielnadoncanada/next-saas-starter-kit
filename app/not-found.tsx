'use client';

import React from 'react';
import { AccountLayout } from '@/components/layouts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <AccountLayout>
      <div className="w-full items-center justify-center lg:px-2 xl:px-0 text-center dark:bg-black">
        <p className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider dark:text-gray-300">
          404
        </p>
        <p className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider dark:text-gray-300 mt-2">
          Page Not Found
        </p>
        <p className="text-lg md:text-xl lg:text-2xl dark:text-gray-500 my-12">
          Sorry, the page you are looking for could not be found.
        </p>
        <div className="mt-8 space-x-5">
          <Link
            href="/"
            className="btn btn-primary btn-md py-3 px-2 sm:px-4 text-white"
          >
            Go Home
          </Link>
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
      </div>
    </AccountLayout>
  );
}
