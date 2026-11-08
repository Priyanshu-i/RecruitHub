// client/src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, Clock, Award, CheckCircle2, ChevronRight, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useDriveStore } from '../store/useDriveStore';
import { useApplicationStore } from '../store/useApplicationStore';
import DriveCard from '../components/DriveCard';
import DriveDetailsModal from '../components/DriveDetailsModal';
import ApplicationTracker from '../components/ApplicationTracker';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function StudentDashboard({ onOpenProfile }) {
  const { user, profile } = useAuthStore();
  const { drives, fetchDrives, selectedDrive, setSelectedDrive } = useDriveStore();
  const { myApplications, fetchMyApplications, applyToDrive, isApplying, successMessage, error: appError, clearNotifications } = useApplicationStore();

  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'applications'
  const [search, setSearch] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDrives();
    fetchMyApplications();
  }, []);

  const studentCgpa = profile?.cgpa;

  // Filter drives by search and CGPA cutoff
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = 
      drive.company_name.toLowerCase().includes(search.toLowerCase()) ||
      drive.title.toLowerCase().includes(search.toLowerCase()) ||
      drive.job_location.toLowerCase().includes(search.toLowerCase());

    const matchesEligibility = !onlyEligible || (studentCgpa !== undefined && studentCgpa >= drive.min_cgpa);

    return matchesSearch && matchesEligibility;
  });

  // Calculate statistics
  const totalApplied = myApplications.length;
  const totalShortlisted = myApplications.filter(a => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW' || a.status === 'OFFERED').length;
  const totalInterviews = myApplications.filter(a => a.status === 'INTERVIEW').length;
  const totalOffers = myApplications.filter(a => a.status === 'OFFERED').length;

  const appliedDriveIds = new Set(myApplications.map(a => a.drive_id));

  const handleApply = async (driveId) => {
    const res = await applyToDrive(driveId);
    if (res.success) {
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-brand-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-brand-500/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                Student Placement Portal
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {profile?.roll_number || 'USN Not Set'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Hello, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
              {profile?.branch || 'Department of Computer Science'} • Class of {profile?.graduation_year || 2026}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 self-start sm:self-auto">
            <div>
              <p className="text-[11px] text-sky-200 uppercase tracking-wider font-semibold">Your CGPA</p>
              <p className="text-2xl font-black">{studentCgpa ? studentCgpa.toFixed(2) : 'N/A'}</p>
            </div>
            <button
              onClick={onOpenProfile}
              className="ml-2 px-3 py-1.5 bg-white text-brand-700 hover:bg-sky-50 text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Applied Drives"
          value={totalApplied}
          subtitle="Total campus submissions"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={totalShortlisted}
          subtitle="Cleared initial screening"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Interviews"
          value={totalInterviews}
          subtitle="Active interview rounds"
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Offers Released"
          value={totalOffers}
          subtitle="Campus selection secured"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={clearNotifications} className="text-emerald-600 hover:underline">Dismiss</button>
        </div>
      )}

      {appError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{appError}</span>
          </div>
          <button onClick={clearNotifications} className="text-rose-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('drives')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${
            activeTab === 'drives'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Active Placement Drives</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {drives.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${
            activeTab === 'applications'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Applications & Status Tracker</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {myApplications.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Drives */}
      {activeTab === 'drives' && (
        <div>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by company, role (e.g. SDE, Frontend), or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={onlyEligible}
                  onChange={e => setOnlyEligible(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span>Only show drives matching my CGPA ({studentCgpa ? studentCgpa.toFixed(1) : '—'})</span>
              </label>
            </div>
          </div>

          {/* Drives Grid */}
          {filteredDrives.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No matching recruitment drives</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try modifying your search or clearing the CGPA eligibility filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrives.map(drive => (
                <DriveCard
                  key={drive.id}
                  drive={drive}
                  studentProfile={profile}
                  isApplied={appliedDriveIds.has(drive.id)}
                  onSelect={(d) => {
                    setSelectedDrive(d);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {myApplications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore active campus drives and apply to start your recruitment journey.
              </p>
              <button
                onClick={() => setActiveTab('drives')}
                className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Browse Placement Drives
              </button>
            </div>
          ) : (
            myApplications.map(app => (
              <div
                key={app.application_id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      {app.company_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{app.drive_title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Package: <strong>{app.ctc_lpa} LPA</strong> • Location: {app.job_location}
                    </p>
                  </div>
                  <div className="self-start sm:self-auto">
                    <StatusBadge status={app.status} />
                  </div>
                </div>

                {/* Pipeline visual stepper */}
                <div className="mt-4">
                  <ApplicationTracker
                    status={app.status}
                    feedback={app.recruiter_feedback}
                    appliedAt={app.applied_at}
                    updatedAt={app.updated_at}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Drive Details & Apply Modal */}
      <DriveDetailsModal
        drive={selectedDrive}
        studentProfile={profile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApply}
        isApplying={isApplying}
        isApplied={selectedDrive ? appliedDriveIds.has(selectedDrive.id) : false}
      />
    </div>
  );
}
