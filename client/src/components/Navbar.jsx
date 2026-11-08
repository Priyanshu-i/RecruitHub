// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { GraduationCap, LogOut, User, Building2, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar({ onOpenProfile }) {
  const { user, profile, isAuthenticated, logout, login } = useAuthStore();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const roleBadgeConfig = {
    STUDENT: {
      label: 'Student',
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: GraduationCap
    },
    RECRUITER: {
      label: 'Recruiter',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Building2
    },
    TPO_ADMIN: {
      label: 'TPO Admin',
      bg: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      icon: ShieldCheck
    }
  };

  const currentRoleConfig = user?.role ? roleBadgeConfig[user.role] : null;
  const RoleIcon = currentRoleConfig?.icon || User;

  const handleQuickSwitch = async (email, password) => {
    setShowDemoMenu(false);
    await login(email, password);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">RecruitHub</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">Campus Placement Portal</p>
          </div>
        </div>

        {/* Right Section */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown (Key for live interviews!) */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                title="Switch demo account instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-fadeIn">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    1-Click Portfolio Roles
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('alice@student.edu', 'Student@123')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-sky-50 text-slate-700 hover:text-sky-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Alice Chen (Student)</div>
                      <div className="text-[11px] text-slate-400">9.1 CGPA • CSE</div>
                    </div>
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-mono">9.1</span>
                  </button>

                  <button
                    onClick={() => handleQuickSwitch('bob@student.edu', 'Student@123')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-sky-50 text-slate-700 hover:text-sky-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Bob Smith (Student)</div>
                      <div className="text-[11px] text-slate-400">7.8 CGPA • IT</div>
                    </div>
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-mono">7.8</span>
                  </button>

                  <button
                    onClick={() => handleQuickSwitch('google@recruiter.com', 'Recruiter@123')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-purple-50 text-slate-700 hover:text-purple-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Sundar Kumar</div>
                      <div className="text-[11px] text-slate-400">Google Recruiter</div>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono">Recruiter</span>
                  </button>

                  <button
                    onClick={() => handleQuickSwitch('admin@college.edu', 'Admin@123')}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">Prof. Rajesh Sharma</div>
                      <div className="text-[11px] text-slate-400">TPO Placement Head</div>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">TPO</span>
                  </button>
                </div>
              )}
            </div>

            {/* Role Badge */}
            {currentRoleConfig && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentRoleConfig.bg}`}>
                <RoleIcon className="w-3.5 h-3.5" />
                {currentRoleConfig.label}
              </span>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {user.role === 'STUDENT' ? (
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  title="View and edit academic profile"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-brand-600 font-medium">Edit Profile & CGPA</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
