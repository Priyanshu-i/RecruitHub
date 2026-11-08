// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, TrendingUp, Users, Briefcase, CheckCircle2, ChevronRight, BarChart2, Layers } from 'lucide-react';
import { apiClient } from '../api/client';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'applications'

  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      try {
        const [statsRes, studentsRes, appsRes] = await Promise.all([
          apiClient('/admin/stats'),
          apiClient('/admin/students'),
          apiClient('/admin/applications')
        ]);

        setStats(statsRes.stats);
        setStudents(studentsRes.students || []);
        setApplications(appsRes.applications || []);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto animate-pulse text-amber-500 mb-3" />
        <p className="text-sm font-semibold">Aggregating Institute Placement Metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* TPO Admin Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-amber-500/10 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                Training & Placement Cell (TPO)
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                Admin Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Campus Placement Analytics & Governance
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
              Real-time oversight over student recruitment funnels, package distributions, and corporate partner drives.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 self-start sm:self-auto text-right">
            <span className="text-[11px] text-amber-200 uppercase tracking-wider font-semibold block">Overall Placement Rate</span>
            <span className="text-2xl sm:text-3xl font-black">{stats?.placementPercentage || 0}%</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle={`${stats?.placedStudents || 0} Placed in Campus Drives`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Placement Rate"
          value={`${stats?.placementPercentage || 0}%`}
          subtitle="Target: 90% institutional goal"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Average CTC"
          value={`${stats?.averageCtc || 0} LPA`}
          subtitle={`Highest: ${stats?.highestCtc || 0} LPA`}
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Active Drives"
          value={stats?.activeDrives || 0}
          subtitle={`${stats?.totalDrives || 0} total corporate drives`}
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Branch Distribution Bar Cards */}
      {stats?.branchDistribution && stats.branchDistribution.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Branch-wise Placement Distribution</h3>
          </div>

          <div className="space-y-4">
            {stats.branchDistribution.map(branch => {
              const pct = branch.total_students > 0 
                ? Math.round((branch.placed_students / branch.total_students) * 100) 
                : 0;

              return (
                <div key={branch.branch} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>{branch.branch}</span>
                    <span className="font-mono text-slate-600">
                      {branch.placed_students} / {branch.total_students} Placed ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative ${
            activeTab === 'students'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Placement Directory</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {students.length}
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
          <Layers className="w-4 h-4" />
          <span>All Campus Applications</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            {applications.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Student Directory */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No & Branch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Skills</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-slate-400 text-[11px]">{s.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-700">{s.roll_number || 'N/A'}</div>
                      <div className="text-slate-500 text-[11px]">{s.branch}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                        {s.cgpa ? s.cgpa.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={s.skills}>
                      {s.skills || 'No skills listed'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{s.applications_count} applied</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.offers_count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Placed ({s.offers_count} Offer)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Seeking Placement
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Applications Funnel */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Company & Drive</th>
                  <th className="py-3 px-4">Package (CTC)</th>
                  <th className="py-3 px-4">Student CGPA</th>
                  <th className="py-3 px-4">Current Pipeline Stage</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map(app => (
                  <tr key={app.application_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.student_name}</div>
                      <div className="text-slate-400 text-[11px]">{app.roll_number} • {app.branch}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{app.company_name}</div>
                      <div className="text-slate-500 text-[11px]">{app.drive_title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {app.ctc_lpa} LPA
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-800">
                        {app.cgpa ? app.cgpa.toFixed(2) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
