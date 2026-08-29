'use client';

import React from 'react';

export const CardSkeleton = () => (
  <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="h-5 bg-slate-200 rounded-md w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded-md w-1/6"></div>
    </div>
    <div className="h-4 bg-slate-150 bg-slate-100 rounded-md w-3/4"></div>
    <div className="h-10 bg-slate-200 rounded-lg w-full mt-2"></div>
  </div>
);

export const TableSkeleton = () => (
  <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200 w-full"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/5"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        <div className="h-8 bg-slate-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <TableSkeleton />
  </div>
);
