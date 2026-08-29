'use client';

import React from 'react';
import { TableSkeleton } from '@/components/feedback/skeletons';
import { Calendar } from 'lucide-react';
import { useAdminAppointments } from '../hooks/useAdminAppointments';

interface AdminAppointmentsProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const AdminAppointments: React.FC<AdminAppointmentsProps> = ({ locale, dict }) => {
  const { appointments, isLoading } = useAdminAppointments();

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{dict.admin?.appointments || 'Global Doctor Appointments'}</h2>
          <p className="text-xs text-slate-500">Monitor platform-wide consultations and upcoming checkups</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">Patient</th>
              <th className="p-4">Doctor & Specialty</th>
              <th className="p-4">Clinic Location</th>
              <th className="p-4">Appointment Date</th>
              <th className="p-4">Follow-up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments?.map((appt) => (
              <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-900">
                  @{appt.profiles?.username || 'patient'}
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-900">Dr. {appt.doctor_name}</div>
                  <span className="text-slate-500">{appt.specialty || 'General'}</span>
                </td>
                <td className="p-4 text-slate-600">
                  {appt.clinic_name || 'N/A'} {appt.clinic_location ? `(${appt.clinic_location})` : ''}
                </td>
                <td className="p-4 text-[#008080] font-semibold">
                  {new Date(appt.appointment_date).toLocaleString()}
                </td>
                <td className="p-4">
                  {appt.is_followup ? (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Yes</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
