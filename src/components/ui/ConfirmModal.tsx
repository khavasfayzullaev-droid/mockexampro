import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "O'chirish",
  cancelText = "Bekor qilish",
  isDestructive = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ margin: 0, padding: 0 }}
    >
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Dialog — true center */}
      <div 
        className="relative w-[90vw] max-w-sm bg-white rounded-3xl p-6 md:p-8"
        style={{ 
          boxShadow: '0 24px 48px -12px rgba(25,28,30,0.18)',
          zIndex: 10000,
        }}
      >
        
        {/* Icon & Title block */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isDestructive ? 'delete' : 'info'}
            </span>
          </div>
          <h3 className="font-headline font-extrabold text-xl text-[#191c1e] tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-[#6b7280] text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.98] ${
              isDestructive 
                ? 'bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:bg-red-600' 
                : 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-[#6b7280] bg-gray-100 hover:bg-gray-200 transition-colors active:scale-[0.98]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
