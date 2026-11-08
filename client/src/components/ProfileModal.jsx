// client/src/components/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X, UserCheck, Award, BookOpen, FileText, Phone, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, profile, updateStudentProfile, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    branch: 'Computer Science and Engineering',
    cgpa: '',
    graduationYear: 2026,
    resumeUrl: '',
    skills: '',
    phone: ''
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profile || user) {
      setFormData({
        name: user?.name || '',
        rollNumber: profile?.roll_number || '',
        branch: profile?.branch || 'Computer Science and Engineering',
        cgpa: profile?.cgpa !== undefined ? String(profile.cgpa) : '',
        graduationYear: profile?.graduation_year || 2026,
        resumeUrl: profile?.resume_url || '',
        skills: profile?.skills || '',
        phone: profile?.phone || ''
      });
    }
  }, [profile, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const res = await updateStudentProfile(formData);
    if (res.success) {
      setMessage({ type: 'success', text: 'Academic profile updated successfully!' });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1200);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-brand-600 font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Student Profile & CGPA</h3>
              <p className="text-xs text-slate-500">Keep academic metrics updated for campus drive eligibility</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-medium border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll / USN Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch / Department</label>
              <select
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
              >
                <option value="Computer Science and Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication">Electronics & Communication</option>
                <option value="Electrical and Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                CGPA (Scale 10.0) <span className="text-brand-600 font-bold">*Cutoff criteria</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={formData.cgpa}
                onChange={e => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={e => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. React, Node.js, Python, PostgreSQL, AWS"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resume Link (PDF / GitHub / Drive)</label>
            <input
              type="url"
              value={formData.resumeUrl}
              onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
              placeholder="https://drive.google.com/your-resume.pdf"
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
