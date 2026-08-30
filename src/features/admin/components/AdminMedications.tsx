'use client';

import React, { useState } from 'react';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pill, Trash2 } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useAdminMedications } from '../hooks/useAdminMedications';

interface AdminMedicationsProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const AdminMedications: React.FC<AdminMedicationsProps> = ({ locale, dict }) => {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { medications, isLoading, deleteMutation } = useAdminMedications(search);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#008080]/10 text-[#008080] flex items-center justify-center font-bold">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{dict.admin?.medications || 'Global Medication Directory'}</h2>
            <p className="text-xs text-slate-500">Inspect and control medication records across all patients</p>
          </div>
        </div>

        <div className="w-full sm:w-72 relative">
          <Input
            placeholder="Search by drug name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Global Medications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">{dict.admin?.medTable?.name}</th>
              <th className="p-4">{dict.admin?.medTable?.patient}</th>
              <th className="p-4">{dict.admin?.medTable?.type}</th>
              <th className="p-4">{dict.admin?.medTable?.dosage}</th>
              <th className="p-4">{dict.admin?.medTable?.stock}</th>
              <th className="p-4 text-right">{dict.admin?.medTable?.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medications?.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-900">{med.name}</td>
                <td className="p-4 text-slate-600">
                  @{med.profiles?.username || 'patient'}
                </td>
                <td className="p-4 capitalize text-slate-500">{med.med_type}</td>
                <td className="p-4 text-slate-700">{med.dosage}</td>
                <td className="p-4">
                  <span className={`font-semibold ${med.stock_count <= med.low_stock_threshold ? 'text-amber-600' : 'text-slate-800'}`}>
                    {med.stock_count}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget({ id: med.id, name: med.name })}
                    isLoading={deleteMutation.isPending && deleteMutation.variables === med.id}
                    className="text-red-600 hover:bg-red-50 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        title={locale === 'ar' ? 'حذف سجل الدواء (إدارة)' : 'Delete Medication Record (Admin)'}
        description={
          locale === 'ar'
            ? 'هل أنت تأكد من أنك تريد حذف هذا الدواء بصفتك مسؤوولاً؟ لا يمكن التراجع عن هذا الإجراء.'
            : 'Are you sure you want to delete this medication record as Admin? This action cannot be undone.'
        }
        itemTitle={deleteTarget?.name}
        locale={locale}
      />
    </div>
  );
};
