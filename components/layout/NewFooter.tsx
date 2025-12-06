// components/layout/NewFooter.tsx
'use client';

import Link from 'next/link';

export function NewFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-[11px] text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-4 md:px-6">
        {/* Logo and address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-[10px] font-semibold text-slate-900">
              DUAAB&apos;89
            </div>
            <p className="text-[11px] font-semibold">
              DUAAB&apos;89
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            House: 11, Road: 33, Gulshan-1, Dhaka
          </p>
          <p className="text-[11px] text-slate-300">
            info@duaab89.org
          </p>
          <div className="space-y-0.5 text-[11px] text-slate-300">
            <p>President: 01716XXXXX</p>
            <p>Secretary: 01715XXXXX</p>
            <p>Treasurer: 01711XXXXX</p>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h5 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
            Quick links
          </h5>
          <ul className="space-y-1 text-[11px] text-slate-300">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/directory" className="hover:text-white">
                Members
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h5 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
            Account
          </h5>
          <ul className="space-y-1 text-[11px] text-slate-300">
            <li>
              <Link href="/auth" className="hover:text-white">
                Login
              </Link>
            </li>
            <li>
              <Link href="/auth" className="hover:text-white">
                Register
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h5 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-100">
            Follow us
          </h5>
          <div className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer">
              f
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer">
              in
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer">
              ▶
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
