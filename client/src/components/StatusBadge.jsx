// client/src/components/StatusBadge.jsx
import React from 'react';

const STATUS_CONFIG = {
  APPLIED: {
    label: 'Applied',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  INTERVIEW: {
    label: 'Interview Round',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500'
  },
  OFFERED: {
    label: 'Offer Extended',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
    dot: 'bg-emerald-500'
  },
  REJECTED: {
    label: 'Not Selected',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500'
  },
  OPEN: {
    label: 'Applications Open',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400'
  }
};

export default function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();
  const config = STATUS_CONFIG[normalized] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
