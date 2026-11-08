// client/src/pages/RecruiterDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Award, Briefcase, Calendar, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDriveStore } from '../store/useDriveStore';
import { useApplicationStore } from '../store/useApplicationStore';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import NewDriveModal from '../components/NewDriveModal';
import ApplicantsModal from '../components/ApplicantsModal';

export default function RecruiterDashboard() {
  const { user, profile } = useAuthStore();
  const { recruiterDrives, fetchRecruiterDrives, updateDrive, isLoading } = useDriveStore();
  const { fetchDriveApplicants } = useApplicationStore();

  const [isNewDriveOpen, setIsNewDriveOpen] = useState(false);
  const [selectedDriveForApplicants, setSelectedDriveForApplicants] = useState(null);
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false);

  useEffect(() => {
    fetchRecruiterDrives();
  }, []);

  const totalDrives = recruiterDrives.length;
  const totalApplicants = recruiterDrives.reduce((sum, d) => sum + (d.total_applicants || 0), 0);
  const totalShortlisted = recruiterDrives.reduce((sum, d) => sum + (d.shortlisted_count || 0), 0);
  const totalOffers = recruiterDrives.reduce((sum, d) => sum + (d.offered_count || 0), 0);

  const handleOpenApplicants = async (drive) => {
    setSelectedDriveForApplicants(drive);
    await fetchDriveApplicants(drive.id);
    setIsApplicantsOpen(true);
  };

  const handleToggleStatus = async (drive) => {
    const nextStatus = drive.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    await updateDrive(drive.id, { status: nextStatus });
    fetchRecruiterDrives();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Recruiter Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-purple-500/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
                Recruiter Portal
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {profile?.company_name || 'Enterprise'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              {profile?.company_name || 'Organization'} Hiring Portal
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-1">
              Logged in as <strong>{user?.name}</strong> • {profile?.designation || 'Lead Recruiter'}
            </p>
          </div>

          <button
            onClick={() => setIsNewDriveOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-purple-800 hover:bg-purple-50 rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Drive</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Drives"
          value={totalDrives}
          subtitle="Campus job postings"
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Total Applicants"
          value={totalApplicants}
          subtitle="Submissions received"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={totalShortlisted}
          subtitle="Screened candidates"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Offers Made"
          value={totalOffers}
          subtitle="Final selections"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Drives Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Campus Recruitment Drives</h3>
            <p className="text-xs text-slate-500">Manage candidate funnels, stage transitions, and criteria</p>
          </div>
          <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full border border-purple-200">
            {recruiterDrives.length} drives
          </span>
        </div>

        {recruiterDrives.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-slate-700">No recruitment drives posted yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Create your first placement drive with custom CGPA criteria and branch filters.
            </p>
            <button
              onClick={() => setIsNewDriveOpen(true)}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Post Drive Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Drive Title</th>
                  <th className="py-3 px-4">CTC & Location</th>
                  <th className="py-3 px-4">Cutoff & Branches</th>
                  <th className="py-3 px-4">Applicant Breakdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recruiterDrives.map(drive => (
                  <tr key={drive.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">{drive.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Posted {new Date(drive.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-emerald-700">{drive.ctc_lpa} LPA</div>
                      <div className="text-slate-500 text-[11px]">{drive.job_location}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">Min CGPA: {drive.min_cgpa.toFixed(1)}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{drive.eligible_branches}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-800 font-bold rounded border border-sky-100 text-[11px]">
                          {drive.total_applicants || 0} Total
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded border border-amber-100 text-[11px]">
                          {drive.shortlisted_count || 0} Shortlisted
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded border border-emerald-100 text-[11px]">
                          {drive.offered_count || 0} Offered
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={drive.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenApplicants(drive)}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg border border-brand-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Applicants ({drive.total_applicants || 0})</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(drive)}
                          className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                            drive.status === 'OPEN'
                              ? 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                              : 'text-emerald-700 hover:text-emerald-800 border-emerald-200 bg-emerald-50'
                          }`}
                        >
                          {drive.status === 'OPEN' ? 'Close Drive' : 'Re-open'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewDriveModal
        isOpen={isNewDriveOpen}
        onClose={() => {
          setIsNewDriveOpen(false);
          fetchRecruiterDrives();
        }}
      />

      <ApplicantsModal
        drive={selectedDriveForApplicants}
        isOpen={isApplicantsOpen}
        onClose={() => {
          setIsApplicantsOpen(false);
          fetchRecruiterDrives();
        }}
      />
    </div>
  );
}
