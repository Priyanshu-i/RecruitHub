// client/src/components/DriveCard.jsx
import React from 'react';
import { Building2, MapPin, Calendar, Award, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DriveCard({ drive, studentProfile, onSelect, isApplied }) {
  const studentCgpa = studentProfile?.cgpa;
  const isEligibleByCgpa = studentCgpa !== undefined && studentCgpa !== null ? studentCgpa >= drive.min_cgpa : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-brand-600 font-bold text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-base leading-snug">{drive.company_name}</h4>
              <p className="text-xs text-slate-500 font-medium">{drive.title}</p>
            </div>
          </div>
          <StatusBadge status={drive.status} />
        </div>

        {/* CTC & Location Badges */}
        <div className="flex flex-wrap items-center gap-2 my-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            {drive.ctc_lpa} LPA
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {drive.job_location}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {drive.description}
        </p>

        {/* Criteria & Eligibility Indicator */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>CGPA Cutoff:</span>
            <span className="font-semibold text-slate-700">{drive.min_cgpa.toFixed(1)}+</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Eligible Branches:</span>
            <span className="font-medium text-slate-700">{drive.eligible_branches}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Deadline:</span>
            <span className="font-medium text-slate-700">
              {new Date(drive.deadline).toLocaleDateString()}
            </span>
          </div>

          {/* Student-specific eligibility check callout */}
          {studentCgpa !== undefined && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              {isEligibleByCgpa ? (
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Eligible (Your CGPA: {studentCgpa.toFixed(2)})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-700 font-medium text-xs bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span>Cutoff {drive.min_cgpa.toFixed(1)} required (Your CGPA: {studentCgpa.toFixed(2)})</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {drive.total_applicants || 0} applicant(s)
        </span>

        {isApplied ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            Applied ✓
          </span>
        ) : (
          <button
            onClick={() => onSelect(drive)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:gap-1.5 transition-all bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200"
          >
            View & Apply
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
