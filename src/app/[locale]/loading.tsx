import React from 'react';
import { DashboardSkeleton } from '@/components/feedback/skeletons';

export default function Loading() {
  return (
    <div className="py-12">
      <DashboardSkeleton />
    </div>
  );
}
