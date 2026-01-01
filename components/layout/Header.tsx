// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-900 text-xs font-semibold text-white">
            DUAAB&apos;89
          </div>
          <div className="text-xs md:text-sm">
            <p className="font-semibold">
              DHAKA UNIVERSITY ALUMNI ASSOCIATION BATCH&apos;89
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-xs font-medium text-slate-700 md:flex">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link href="/about" className="hover:text-slate-900">
            About
          </Link>
          <Link href="/directory" className="hover:text-slate-900">
            Members
          </Link>
          <Link href="/committee" className="hover:text-slate-900">
            Committee
          </Link>
          <Link href="/news" className="hover:text-slate-900">
            News &amp; Events
          </Link>
          <Link href="/gallery" className="hover:text-slate-900">
            Gallery
          </Link>
          <Link href="/archive" className="hover:text-slate-900">
            Archive
          </Link>
          <Link href="/blog" className="hover:text-slate-900">
            Blog
          </Link>
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          <Link href="/fund" className="hover:text-slate-900">
            Fund
          </Link>
          <Button
            size="sm"
            className="ml-1 rounded-full bg-[#2e2c6d] px-4 text-xs font-semibold text-white hover:bg-[#252350]"
            asChild
          >
            <Link href="/auth?mode=signup">Member Registration</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
