// client/src/components/DriveDetailsModal.jsx
import React from 'react';
import { X, Building2, MapPin, Calendar, Award, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DriveDetailsModal({ drive, studentProfile, isOpen, onClose, onApply, isApplying, isApplied }) {
  if (!isOpen || !drive) return null;

  const studentCgpa = studentProfile?.cgpa;
  const isEligible = studentCgpa !== undefined && studentCgpa !== null ? studentCgpa >= drive.min_cgpa : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-brand-600 font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{drive.company_name}</h3>
              <p className="text-sm text-slate-500 font-medium">{drive.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 font-medium block">Package (CTC)</span>
            <span className="text-base font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <Award className="w-4 h-4" />
              {drive.ctc_lpa} LPA
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 font-medium block">CGPA Cutoff</span>
            <span className="text-base font-bold text-slate-800 mt-0.5 block">
              {drive.min_cgpa.toFixed(1)}+
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 font-medium block">Location</span>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              {drive.job_location}
            </span>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-4 text-sm text-slate-700">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Role & Responsibility Overview
            </h4>
            <p className="leading-relaxed whitespace-pre-line text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm">
              {drive.description}
            </p>
          </div>

          {/* Criteria info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-medium block">Eligible Branches</span>
              <span className="font-semibold text-slate-800 mt-1 block">
                {drive.eligible_branches}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-400 font-medium block">Application Deadline</span>
              <span className="font-semibold text-slate-800 mt-1 block">
                {new Date(drive.deadline).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Eligibility evaluation box for students */}
          {studentCgpa !== undefined && (
            <div className="mt-4">
              {isEligible ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>You are eligible to apply:</strong> Your CGPA ({studentCgpa.toFixed(2)}) meets the minimum cutoff of {drive.min_cgpa.toFixed(1)}.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    <strong>Cutoff requirement not met:</strong> Minimum CGPA of {drive.min_cgpa.toFixed(1)} required (Your CGPA: {studentCgpa.toFixed(2)}).
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>

          {isApplied ? (
            <div className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Already Applied
            </div>
          ) : (
            <button
              onClick={() => onApply(drive.id)}
              disabled={isApplying || !isEligible || drive.status !== 'OPEN'}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              {isApplying ? 'Submitting Application...' : 'Apply for this Drive'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
