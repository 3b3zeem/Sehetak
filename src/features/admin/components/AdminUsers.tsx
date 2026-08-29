'use client';

import React, { useState } from 'react';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Shield, Users } from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdminUsers';

interface AdminUsersProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ locale, dict }) => {
  const [search, setSearch] = useState('');
  const { users, isLoading, toggleRoleMutation } = useAdminUsers(search);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{dict.admin?.users || 'User Directory'}</h2>
            <p className="text-xs text-slate-500">Manage patient accounts and elevate administrators</p>
          </div>
        </div>

        <div className="w-full sm:w-72 relative">
          <Input
            placeholder="Search by username, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">{dict.admin?.userTable?.user}</th>
              <th className="p-4">{dict.admin?.userTable?.email}</th>
              <th className="p-4">{dict.admin?.userTable?.role}</th>
              <th className="p-4">{dict.admin?.userTable?.joined}</th>
              <th className="p-4 text-right">{dict.admin?.userTable?.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-900">@{u.username}</div>
                  <span className="text-slate-500">{u.full_name || 'No name'}</span>
                </td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-slate-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleRoleMutation.mutate({
                        userId: u.id,
                        newRole: u.role === 'admin' ? 'patient' : 'admin',
                      })
                    }
                    isLoading={toggleRoleMutation.isPending && toggleRoleMutation.variables?.userId === u.id}
                    className="gap-1 text-slate-700"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>{u.role === 'admin' ? 'Make Patient' : 'Make Admin'}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
