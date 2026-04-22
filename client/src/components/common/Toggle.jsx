import React from 'react';

const Toggle = ({ enabled, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100">
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-800">{label}</h4>
        {description && <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500/20 ${
          enabled ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-slate-200'
        }`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white shadow-sm'
          } inline-block h-5 w-5 transform rounded-full transition-all duration-300 ease-out`}
        />
      </button>
    </div>
  );
};

export default Toggle;
