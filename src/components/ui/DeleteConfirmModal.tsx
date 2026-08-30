'use client';

import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemTitle?: string;
  locale?: 'en' | 'ar';
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemTitle,
  locale = 'ar',
  isLoading = false,
}) => {
  const isAr = locale === 'ar';

  const defaultTitle = isAr ? 'تأكيد الحذف' : 'Confirm Deletion';
  const defaultDescription = isAr
    ? 'هل أنت تأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.'
    : 'Are you sure you want to delete this item? This action cannot be undone.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || defaultTitle}
    >
      <div className="space-y-6 text-slate-800">
        {/* Warning Icon & Header Box */}
        <div className="flex items-start gap-4 p-4 bg-red-50/80 border border-red-200">
          <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-red-900 text-sm">
              {isAr ? 'إجراء حساس وغير قابل للتراجع' : 'Irreversible Action'}
            </h4>
            <p className="text-xs text-red-700 leading-relaxed">
              {description || defaultDescription}
            </p>
          </div>
        </div>

        {/* Item Title Badge if provided */}
        {itemTitle && (
          <div className="p-3 bg-slate-100 border border-slate-300 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-semibold text-slate-500">{isAr ? 'العنصر المحدد:' : 'Target Item:'}</span>
            <span className="font-bold text-slate-900">{itemTitle}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>

          <Button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isAr ? 'تأكيد الحذف النهائي' : 'Confirm Delete'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
