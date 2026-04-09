"use client";

import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-ku-navy rounded-full flex items-center justify-center text-white font-bold text-xl">
                KU
              </div>
              <div>
                <h1 className="text-xl font-bold text-ku-navy leading-none">Karnavati University</h1>
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Student WellFare</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* The user avatar or login actions will go here later */}
          </div>
        </div>
      </div>
    </nav>
  );
}
