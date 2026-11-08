// client/src/components/NewDriveModal.jsx
import React, { useState } from 'react';
import { X, Briefcase, PlusCircle, Building2 } from 'lucide-react';
import { useDriveStore } from '../store/useDriveStore';
import { useAuthStore } from '../store/useAuthStore';

export default function NewDriveModal({ isOpen, onClose }) {
  const { createDrive, isLoading } = useDriveStore();
  const { profile, user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    companyName: profile?.company_name || user?.name || '',
    ctcLpa: '',
    minCgpa: '7.0',
    eligibleBranches: 'CSE,IT,ECE',
    jobLocation: 'Bengaluru, India',
    deadline: '',
    description: ''
  });

  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await createDrive(formData);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to post drive.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-brand-600 font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Post New Campus Drive</h3>
              <p className="text-xs text-slate-500">Configure recruitment criteria, cutoff, and compensation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Role Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineer - Backend"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package CTC (in LPA)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 18.5"
                value={formData.ctcLpa}
                onChange={e => setFormData({ ...formData, ctcLpa: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                CGPA Cutoff (Scale 10) <span className="text-brand-600 font-bold">*Cutoff</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                placeholder="e.g. 7.5"
                value={formData.minCgpa}
                onChange={e => setFormData({ ...formData, minCgpa: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligible Branches</label>
              <input
                type="text"
                required
                placeholder="CSE,IT,ECE (or ALL)"
                value={formData.eligibleBranches}
                onChange={e => setFormData({ ...formData, eligibleBranches: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Bengaluru / Hyderabad / Remote"
              value={formData.jobLocation}
              onChange={e => setFormData({ ...formData, jobLocation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description & Responsibilities</label>
            <textarea
              rows={4}
              required
              placeholder="Describe candidate requirements, technical stack, interview stages, and expectations..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              {isLoading ? 'Publishing Drive...' : 'Publish Drive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
