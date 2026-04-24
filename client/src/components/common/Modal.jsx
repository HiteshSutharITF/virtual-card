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
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center overflow-hidden">
      <div className="flex items-end sm:items-center justify-center sm:p-4 text-center min-h-screen">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 sm:bg-slate-900/60 backdrop-blur-sm sm:backdrop-blur-md transition-opacity animate-fade-in" 
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className={`relative w-full ${sizeClasses[size]} glass rounded-t-[2.5rem] sm:rounded-[3rem] shadow-2xl px-6 py-5 sm:p-12 text-left animate-slide-up sm:animate-fade-in z-10 border-t border-x border-white/20 sm:border sm:rounded-b-[3rem] sm:my-8`}>
          {/* Bottom Sheet Handle */}
          <div className="w-12 h-1 bg-slate-400/20 rounded-full mx-auto mb-5 sm:hidden -mt-1"></div>
          
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-slate-200/20">
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2.5 sm:p-3 bg-slate-100/50 sm:bg-transparent hover:bg-slate-200/50 rounded-full sm:rounded-2xl transition-all text-slate-500 hover:text-slate-700 shadow-sm"
            >
              <X size={18} className="sm:w-6 sm:h-6" />
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
