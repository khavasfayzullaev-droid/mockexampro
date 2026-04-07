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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-[0_24px_48px_-12px_rgba(25,28,30,0.12)] border border-outline-variant/20 p-6 md:p-8 animate-in zoom-in-95 duration-300">
        
        {/* Icon & Title block */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-primary-container text-primary'}`}>
            <span className="material-symbols-outlined text-3xl">
              {isDestructive ? 'delete' : 'info'}
            </span>
          </div>
          <h3 className="font-headline font-extrabold text-xl text-on-surface tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed font-body">
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
            className={`w-full py-3.5 rounded-xl font-bold transition-all active:scale-95 ${
              isDestructive 
                ? 'bg-red-600 text-white shadow-md hover:bg-red-700' 
                : 'bg-primary text-white shadow-md hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
          
          <button 
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors active:scale-95 border border-transparent"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
