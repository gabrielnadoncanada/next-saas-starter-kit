'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import FAQSection from '@/components/defaultLanding/FAQSection';
import HeroSection from '@/components/defaultLanding/HeroSection';
import FeatureSection from '@/components/defaultLanding/FeatureSection';
import PricingSection from '@/components/defaultLanding/PricingSection';
import env from '@/lib/env';

export default function HomePage() {
  // Redirect to login page if landing page is disabled
  if (env.hideLandingPage) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto">
      <div className="navbar bg-base-100 px-0 sm:px-1">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl normal-case">
            BoxyHQ
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal flex items-center gap-2 sm:gap-4">
            <li>
              <Link
                href="/auth/join"
                className="btn btn-primary btn-md py-3 px-2 sm:px-4 text-white"
              >
                Sign Up
              </Link>
            </li>
            <li>
              <Link
                href="/auth/login"
                className="btn btn-primary dark:border-zinc-600 dark:border-2 dark:text-zinc-200 btn-outline py-3 px-2 sm:px-4 btn-md"
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <HeroSection />
      <div className="divider"></div>
      <FeatureSection />
      <div className="divider"></div>
      <PricingSection />
      <div className="divider"></div>
      <FAQSection />
    </div>
  );
}
