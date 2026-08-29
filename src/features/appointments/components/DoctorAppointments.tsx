'use client';

import React, { useState, useRef } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { CardSkeleton } from '@/components/feedback/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Calendar, Plus, MapPin, User, Upload, Clock, Edit3, Trash2, Bell, FileText, CheckCircle2, X, ExternalLink, Loader2, Eye, Image as ImageIcon } from 'lucide-react';
import { DoctorAppointmentRow } from '@/types';
import { toast } from 'sonner';

interface AppointmentsProps {
  locale: 'en' | 'ar';
  dict: any;
}

export const DoctorAppointments: React.FC<AppointmentsProps> = ({ locale, dict }) => {
  const { appointments, isLoading, addAppointment, updateAppointment, deleteAppointment, isAdding, isUpdating } = useAppointments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [isFollowup, setIsFollowup] = useState(false);
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState('30');
  const [notes, setNotes] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  // Device file upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Image Preview State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setDoctorName('');
    setSpecialty('');
    setClinicName('');
    setClinicLocation('');
    setAppointmentDate('');
    setIsFollowup(false);
    setRemindBeforeMinutes('30');
    setNotes('');
    setReportUrl('');
    setUploadedFileName('');
    setIsModalOpen(true);
  };

  const openEditModal = (appt: DoctorAppointmentRow) => {
    setEditingId(appt.id);
    setDoctorName(appt.doctor_name || '');
    setSpecialty(appt.specialty || '');
    setClinicName(appt.clinic_name || '');
    setClinicLocation(appt.clinic_location || '');
    
    if (appt.appointment_date) {
      const d = new Date(appt.appointment_date);
      const isoStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setAppointmentDate(isoStr);
    } else {
      setAppointmentDate('');
    }

    setIsFollowup(appt.is_followup || false);
    setRemindBeforeMinutes(String(appt.remind_before_minutes || 30));
    setNotes(appt.notes || '');
    setReportUrl(appt.report_url || '');
    setUploadedFileName(appt.report_url ? (locale === 'ar' ? 'تقرير طبي مرفق' : 'Attached Report') : '');
    setIsModalOpen(true);
  };

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Upload failed');

      setReportUrl(json.data.url);
      setUploadedFileName(file.name);
      toast.success(locale === 'ar' ? 'تم رفع الملف بنجاح!' : 'File uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || (locale === 'ar' ? 'فشل رفع الملف' : 'File upload failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      doctor_name: doctorName,
      specialty,
      clinic_name: clinicName,
      clinic_location: clinicLocation,
      appointment_date: new Date(appointmentDate).toISOString(),
      is_followup: isFollowup,
      remind_before_minutes: parseInt(remindBeforeMinutes, 10) || 30,
      notes,
      report_url: reportUrl || null,
    };

    if (editingId) {
      await updateAppointment({ id: editingId, data: payload });
    } else {
      await addAppointment(payload);
    }
    setIsModalOpen(false);
  };

  const isImageFile = (url: string) => {
    if (!url) return false;
    return url.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url);
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
          <h2 className="text-xl font-bold text-slate-900">{dict.appointments?.title || 'Doctor Appointments'}</h2>
          <p className="text-xs text-slate-500 mt-1">Manage checkups, doctor consultations, and prescription reports</p>
        </div>

        <Button variant="primary" onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>{dict.appointments?.addNew || 'Add Appointment'}</span>
        </Button>
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-500">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">{dict.appointments?.emptyState || 'No upcoming doctor appointments'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {appointments.map((appt) => {
            const dateObj = new Date(appt.appointment_date);
            const dateStr = dateObj.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isImg = appt.report_url ? isImageFile(appt.report_url) : false;

            return (
              <div
                key={appt.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative group flex flex-col justify-between"
              >
                <div className="space-y-4">
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

                    <div className="flex items-center gap-2">
                      {appt.is_followup && (
                        <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                          Follow-up
                        </span>
                      )}

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => openEditModal(appt)}
                          title="Edit appointment"
                          className="p-1.5 text-slate-600 hover:text-[#008080] hover:bg-white rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(locale === 'ar' ? 'هل أنت تأكد من حذف هذا الموعد؟' : 'Are you sure you want to delete this appointment?')) {
                              deleteAppointment(appt.id);
                            }
                          }}
                          title="Delete appointment"
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-white rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Clock className="w-4 h-4 text-[#008080]" />
                      <span>{dateStr} at {timeStr}</span>
                    </div>

                    {/* Reminder Badge */}
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md w-fit font-medium">
                      <Bell className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {locale === 'ar'
                          ? `تنبيه قبل الموعد بـ ${appt.remind_before_minutes || 30} دقيقة`
                          : `Remind ${appt.remind_before_minutes || 30} min before`}
                      </span>
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

                {/* Attached File Preview on Card */}
                {appt.report_url && (
                  <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
                    {isImg ? (
                      <div className="relative group/img rounded-xl overflow-hidden border border-slate-200 max-h-36 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={appt.report_url}
                          alt="Prescription Report"
                          className="w-full h-36 object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setLightboxImage(appt.report_url)}
                            className="bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#008080]" />
                            <span>{locale === 'ar' ? 'معاينة الصورة' : 'Preview'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={appt.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-xs text-[#008080] hover:text-[#006666] font-medium bg-[#008080]/5 border border-[#008080]/20 p-2.5 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 shrink-0" />
                          <span className="truncate">{locale === 'ar' ? 'عرض التقرير الطبي المرفق' : 'View Attached Report'}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Creating / Editing Appointments */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? (dict.common?.edit || 'Edit Appointment') : (dict.appointments?.addNew || 'Schedule Checkup')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={dict.appointments?.doctorName || 'Doctor Name'}
            required
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="e.g. Dr. Ahmed Zaki"
          />

          <Input
            label={dict.appointments?.specialty || 'Specialty'}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="e.g. Cardiology"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={dict.appointments?.clinicName || 'Clinic Name'}
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="e.g. Heart Care Center"
            />
            <Input
              label={dict.appointments?.location || 'Clinic Location'}
              value={clinicLocation}
              onChange={(e) => setClinicLocation(e.target.value)}
              placeholder="Building B, 3rd Floor"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={dict.appointments?.appointmentDate || 'Appointment Date & Time'}
              type="datetime-local"
              required
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />

            <Select
              label={locale === 'ar' ? 'وقت التنبيه قبل الموعد' : 'Reminder Timing'}
              value={remindBeforeMinutes}
              onChange={(e) => setRemindBeforeMinutes(e.target.value)}
              options={[
                { value: '15', label: locale === 'ar' ? 'قبل الموعد بـ 15 دقيقة' : '15 minutes before' },
                { value: '30', label: locale === 'ar' ? 'قبل الموعد بـ 30 دقيقة' : '30 minutes before' },
                { value: '60', label: locale === 'ar' ? 'قبل الموعد بـ ساعة واحدة' : '1 hour before' },
                { value: '120', label: locale === 'ar' ? 'قبل الموعد بـ ساعتين' : '2 hours before' },
                { value: '1440', label: locale === 'ar' ? 'قبل الموعد بـ يوم واحد (24 ساعة)' : '1 day before' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_followup"
              checked={isFollowup}
              onChange={(e) => setIsFollowup(e.target.checked)}
              className="w-4 h-4 text-[#008080] rounded focus:ring-[#008080]"
            />
            <label htmlFor="is_followup" className="text-xs font-semibold text-slate-700">
              {dict.appointments?.isFollowup || 'Follow-up Consultation'}
            </label>
          </div>

          {/* Device File Upload Field with Image Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              {locale === 'ar' ? 'إرفاق الروشتة أو التقرير الطبي' : 'Attach Prescription / Medical Report'}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDeviceFileUpload}
              accept="image/*,.pdf"
              className="hidden"
            />

            {reportUrl ? (
              <div className="border border-teal-200 bg-teal-50/70 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-teal-800 font-medium truncate max-w-[80%]">
                    <CheckCircle2 className="w-4 h-4 text-[#008080] shrink-0" />
                    <span className="truncate">{uploadedFileName || reportUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReportUrl('');
                      setUploadedFileName('');
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Preview inside Modal */}
                {isImageFile(reportUrl) && (
                  <div className="relative rounded-xl overflow-hidden border border-teal-300/60 max-h-48 bg-slate-900/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reportUrl}
                      alt="Prescription Preview"
                      className="w-full h-44 object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#008080] rounded-xl p-5 text-center bg-slate-50/50 hover:bg-teal-50/30 cursor-pointer transition-all space-y-2 group"
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-[#008080] font-semibold py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{locale === 'ar' ? 'جاري رفع الملف من جهازك...' : 'Uploading file from device...'}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-[#008080]/10 text-slate-500 group-hover:text-[#008080] flex items-center justify-center mx-auto transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">
                        {locale === 'ar' ? 'اضغط لاختيار صورة أو تقرير من جهازك' : 'Click to select an image or report from device'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {locale === 'ar' ? 'معاينة فورية للصور (PNG, JPG, WebP) وملفات الـ PDF' : 'Instant preview for images (PNG, JPG, WebP) & PDFs'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {dict.common?.cancel || 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={isAdding || isUpdating || isUploading}>
              {editingId ? (dict.common?.save || 'Save Changes') : (dict.appointments?.saveAppointment || 'Schedule Appointment')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Full Lightbox Preview Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-white border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-2 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#008080]" />
                {locale === 'ar' ? 'معاينة الروشتة / التقرير الطبي' : 'Prescription / Medical Report Lightbox'}
              </span>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-auto flex items-center justify-center p-2 bg-slate-900/5 rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage}
                alt="Full Prescription View"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
