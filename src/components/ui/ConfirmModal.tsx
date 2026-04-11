"use client";
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modal = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        style={{
          position: 'relative',
          width: '90vw',
          maxWidth: '380px',
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.2)',
          zIndex: 100000,
          animation: 'modalIn 0.2s ease-out',
        }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div 
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              backgroundColor: isDestructive ? '#fef2f2' : '#eff6ff',
              color: isDestructive ? '#ef4444' : '#2563eb',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', fontVariationSettings: "'FILL' 1" }}>
              {isDestructive ? 'delete' : 'info'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#191c1e', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6, fontWeight: 500 }}>
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '1rem',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              backgroundColor: isDestructive ? '#ef4444' : '#2563eb',
              color: '#ffffff',
              boxShadow: isDestructive 
                ? '0 8px 20px rgba(239,68,68,0.3)' 
                : '0 8px 20px rgba(37,99,235,0.3)',
            }}
          >
            {confirmText}
          </button>
          
          <button 
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '1rem',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
