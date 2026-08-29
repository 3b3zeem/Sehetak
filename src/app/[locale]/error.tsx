'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm my-8">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-xs text-slate-500 max-w-md mb-6">{error.message || 'An unexpected error occurred.'}</p>
      <Button variant="primary" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
