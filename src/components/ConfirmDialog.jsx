import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Reusable confirmation dialog component
 * Replaces browser confirm() dialogs with a branded, styled alternative
 */
const ConfirmDialog = ({
  show,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          {isDangerous && <AlertTriangle className="w-5 h-5 text-red-400" />}
          <h2 className="text-lg font-semibold text-white flex-1 ml-3">{title}</h2>
          <button
            onClick={onCancel}
            className="p-1 text-white/40 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <p className="text-white/70">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 pt-0 justify-end border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium text-white transition ${
              isDangerous
                ? 'bg-red-500/80 hover:bg-red-600 text-white'
                : 'bg-teal-500/80 hover:bg-teal-600 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
