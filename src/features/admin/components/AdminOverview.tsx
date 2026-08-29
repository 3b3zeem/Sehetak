'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminOverviewStats, ApiResponse } from '@/types';
import { DashboardSkeleton } from '@/components/feedback/skeletons';
import { Users, Pill, Activity, BellRing, Shield, Clock } from 'lucide-react';

interface AdminOverviewProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ locale, dict }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async (): Promise<AdminOverviewStats> => {
      const res = await fetch('/api/admin/overview');
      const json: ApiResponse<AdminOverviewStats> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch admin stats');
      return json.data!;
    },
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>Platform Overseer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{dict.admin?.portalTitle}</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time health telemetry and global medication administration</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">{dict.admin?.totalUsers}</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">{dict.admin?.activeMeds}</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{stats?.totalActiveMedications || 0}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">{dict.admin?.adherenceRate}</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{stats?.platformAdherenceRate || 100}%</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">{dict.admin?.remindersSent}</span>
            <h3 className="text-2xl font-extrabold text-slate-900">{stats?.totalRemindersDispatched || 0}</h3>
          </div>
        </div>
      </div>

      {/* Recent Registered Patients */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#008080]" />
          <span>Recently Registered Patients</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">@{u.username}</td>
                  <td className="p-3 text-slate-700">{u.full_name || 'N/A'}</td>
                  <td className="p-3 text-slate-500">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
