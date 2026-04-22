import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fade-in" 
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className={`relative w-full ${sizeClasses[size]} glass rounded-[3rem] shadow-2xl p-8 sm:p-12 text-left animate-fade-in z-10 my-8 border border-white/20`}>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/20">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600 shadow-sm"
            >
              <X size={24} />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
