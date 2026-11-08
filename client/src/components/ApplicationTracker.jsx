// client/src/components/ApplicationTracker.jsx
import React from 'react';
import { CheckCircle2, Clock, XCircle, Award } from 'lucide-react';

const STAGES = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFERED', label: 'Offered' }
];

export default function ApplicationTracker({ status, feedback, appliedAt, updatedAt }) {
  const isRejected = status === 'REJECTED';
  
  // Find current step index in normal pipeline
  const currentIndex = STAGES.findIndex(s => s.key === status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recruitment Pipeline Status
        </h4>
        <span className="text-xs text-slate-400">
          Applied {new Date(appliedAt).toLocaleDateString()}
        </span>
      </div>

      {isRejected ? (
        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
          <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-semibold">Application Not Selected</p>
            <p className="text-xs text-rose-600 mt-0.5">
              {feedback || 'Thank you for your interest. We encourage you to apply for other campus opportunities.'}
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Stepper bar */}
          <div className="relative flex items-center justify-between w-full mb-3">
            {/* Background connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            
            {/* Filled progress line */}
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{
                width: currentIndex >= 0 ? `${(currentIndex / (STAGES.length - 1)) * 100}%` : '0%'
              }}
            />

            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isOffered = stage.key === 'OFFERED' && isCurrent;

              let circleClasses = 'bg-white border-2 border-slate-300 text-slate-400';
              if (isCompleted) {
                circleClasses = 'bg-emerald-500 border-2 border-emerald-500 text-white';
              } else if (isCurrent) {
                circleClasses = isOffered 
                  ? 'bg-emerald-600 border-2 border-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                  : 'bg-brand-600 border-2 border-brand-600 text-white ring-4 ring-sky-100';
              }

              return (
                <div key={stage.key} className="relative z-10 flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${circleClasses}`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isOffered ? (
                      <Award className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-[11px] mt-1.5 font-medium ${isCurrent ? 'text-brand-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Feedback note if present */}
          {feedback && (
            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-600">Recruiter Notes:</p>
              <p className="text-xs text-slate-700 mt-0.5 italic">"{feedback}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
