import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  id?: string;
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  id = 'confirm-dialog',
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id={`${id}-backdrop`}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        id={id}
        className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-[#dbc1b5]/60 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                danger ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#f8ece1] text-[#964407]'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#201b14] text-base leading-tight">
              {title}
            </h3>
          </div>
          <button
            type="button"
            id={`${id}-btn-close`}
            onClick={onCancel}
            className="text-[#887368] hover:text-[#201b14] p-1 rounded-lg hover:bg-[#f8ece1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#554339] leading-relaxed mb-5">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            id={`${id}-btn-cancel`}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#554339] bg-[#f8ece1]/70 hover:bg-[#f8ece1] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id={`${id}-btn-confirm`}
            onClick={() => {
              onConfirm();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer active:scale-98 ${
              danger
                ? 'bg-[#ba1a1a] hover:bg-[#93000a] shadow-xs'
                : 'bg-[#964407] hover:bg-[#773300] shadow-xs'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
