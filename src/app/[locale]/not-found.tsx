import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm my-8">
      <h1 className="text-6xl font-extrabold text-[#008080] mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-md mb-6">
        The requested page does not exist or has been moved.
      </p>
      <Link href="/en">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
