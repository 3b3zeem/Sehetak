'use client';

import React, { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { CardSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Calendar, Plus, MapPin, User, FileText, Upload, Clock } from 'lucide-react';

interface AppointmentsProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const DoctorAppointments: React.FC<AppointmentsProps> = ({ locale, dict }) => {
  const { appointments, isLoading, addAppointment, isAdding } = useAppointments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [isFollowup, setIsFollowup] = useState(false);
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState('30');
  const [notes, setNotes] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAppointment({
      doctor_name: doctorName,
      specialty,
      clinic_name: clinicName,
      clinic_location: clinicLocation,
      appointment_date: new Date(appointmentDate).toISOString(),
      is_followup: isFollowup,
      remind_before_minutes: parseInt(remindBeforeMinutes, 10),
      notes,
      report_url: reportUrl || null,
    });
    setIsModalOpen(false);
    // Reset form
    setDoctorName('');
    setSpecialty('');
    setClinicName('');
    setClinicLocation('');
    setAppointmentDate('');
    setNotes('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{dict.appointments?.title}</h2>
          <p className="text-xs text-slate-500 mt-1">Manage checkups, doctor consultations, and prescription reports</p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>{dict.appointments?.addNew}</span>
        </Button>
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">{dict.appointments?.emptyState}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const dateObj = new Date(appt.appointment_date);
            const dateStr = dateObj.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={appt.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0077b6]/10 text-[#0077b6] flex items-center justify-center font-bold">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Dr. {appt.doctor_name}</h4>
                      <span className="text-xs font-semibold text-[#0077b6] bg-cyan-50 px-2 py-0.5 rounded">
                        {appt.specialty || 'General Practitioner'}
                      </span>
                    </div>
                  </div>

                  {appt.is_followup && (
                    <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                      Follow-up
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Clock className="w-4 h-4 text-[#008080]" />
                    <span>{dateStr} at {timeStr}</span>
                  </div>

                  {appt.clinic_name && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{appt.clinic_name} {appt.clinic_location ? `• ${appt.clinic_location}` : ''}</span>
                    </div>
                  )}

                  {appt.notes && (
                    <p className="text-slate-500 italic bg-slate-50 p-2.5 rounded-lg mt-2">
                      &quot;{appt.notes}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={dict.appointments?.addNew || 'Schedule Checkup'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={dict.appointments?.doctorName}
            required
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="e.g. Dr. Ahmed Zaki"
          />

          <Input
            label={dict.appointments?.specialty}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="e.g. Cardiology"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={dict.appointments?.clinicName}
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="e.g. Heart Care Center"
            />
            <Input
              label={dict.appointments?.location}
              value={clinicLocation}
              onChange={(e) => setClinicLocation(e.target.value)}
              placeholder="Building B, 3rd Floor"
            />
          </div>

          <Input
            label={dict.appointments?.appointmentDate}
            type="datetime-local"
            required
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_followup"
              checked={isFollowup}
              onChange={(e) => setIsFollowup(e.target.checked)}
              className="w-4 h-4 text-[#008080] rounded focus:ring-[#008080]"
            />
            <label htmlFor="is_followup" className="text-xs font-semibold text-slate-700">
              {dict.appointments?.isFollowup}
            </label>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <span className="text-xs text-slate-600 block">{dict.appointments?.uploadReport}</span>
            <input
              type="text"
              placeholder="https://... file URL"
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
              className="mt-2 text-xs w-full px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {dict.common?.cancel}
            </Button>
            <Button type="submit" variant="primary" isLoading={isAdding}>
              {dict.appointments?.saveAppointment}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
