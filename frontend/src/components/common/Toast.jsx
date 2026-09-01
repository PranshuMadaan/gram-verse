import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    error: <AlertOctagon className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/40 bg-[#0e1c18]',
    warning: 'border-amber-500/40 bg-[#1c180e]',
    error: 'border-rose-500/40 bg-[#1c0e12]',
    info: 'border-cyan-500/40 bg-[#0e1724]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-lg ${
          borders[toast.type] || borders.info
        }`}
      >
        <div className="flex-shrink-0">{icons[toast.type] || icons.info}</div>
        <div className="text-sm font-medium text-slate-100">{toast.message}</div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className={`w-full ${maxWidth} bg-[#0e1624] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d2e]/80">
          <h3 className="text-base font-semibold text-white tracking-wide flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
