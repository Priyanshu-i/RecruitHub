// client/src/components/ApplicantsModal.jsx
import React, { useState } from 'react';
import { X, Users, Award, ExternalLink, Check, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useApplicationStore } from '../store/useApplicationStore';

export default function ApplicantsModal({ isOpen, onClose, drive }) {
  const { driveApplicants, currentDriveInfo, updateApplicantStatus } = useApplicationStore();

  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('SHORTLISTED');
  const [feedback, setFeedback] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdating(true);
    const res = await updateApplicantStatus(selectedApp.application_id, newStatus, feedback);
    setIsUpdating(false);

    if (res.success) {
      setToast({ type: 'success', text: `Applicant transitioned to ${newStatus}` });
      setSelectedApp(null);
      setFeedback('');
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ type: 'error', text: res.error || 'Failed to update status.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Applicants: {currentDriveInfo?.title || drive?.title}
              </h3>
              <p className="text-xs text-slate-500">
                {currentDriveInfo?.company || drive?.company_name} • {driveApplicants.length} candidate(s)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {toast && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-medium border flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
            {toast.text}
          </div>
        )}

        {/* Content Table */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {driveApplicants.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No candidates have applied for this drive yet.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No & Branch</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Resume / Skills</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {driveApplicants.map((app) => (
                    <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{app.student_name}</div>
                        <div className="text-slate-400 text-[11px]">{app.student_email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-mono text-[11px] font-semibold text-slate-700 block">{app.roll_number}</span>
                        <span className="text-slate-500">{app.branch}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {app.cgpa ? app.cgpa.toFixed(2) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {app.resume_url ? (
                          <a
                            href={app.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-brand-600 hover:underline font-medium text-[11px]"
                          >
                            Resume <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No link</span>
                        )}
                        {app.skills && (
                          <p className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5" title={app.skills}>
                            {app.skills}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                        {app.recruiter_feedback && (
                          <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1" title={app.recruiter_feedback}>
                            "{app.recruiter_feedback}"
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setNewStatus(app.status === 'APPLIED' ? 'SHORTLISTED' : app.status === 'SHORTLISTED' ? 'INTERVIEW' : 'OFFERED');
                            setFeedback(app.recruiter_feedback || '');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inline status update drawer/form when an applicant is selected */}
        {selectedApp && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex-shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800">
                Update Status for: <span className="text-brand-600">{selectedApp.student_name}</span> ({selectedApp.roll_number})
              </h4>
              <button onClick={() => setSelectedApp(null)} className="text-xs text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Stage</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW">Interview Round</option>
                  <option value="OFFERED">Offer Extended 🎉</option>
                  <option value="REJECTED">Reject / Not Selected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recruiter Notes / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared round 1, interview on Monday"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
                >
                  {isUpdating ? 'Saving...' : 'Confirm Transition'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
