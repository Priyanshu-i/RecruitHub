// client/src/pages/Login.jsx
import React, { useState } from 'react';
import { GraduationCap, Building2, ShieldCheck, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Login({ onSwitchToRegister }) {
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    clearError();
    await login(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/20 mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome to RecruitHub
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Campus Recruitment & Placement Automation Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Credentials Panel for Interviewers */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50/50 rounded-2xl p-4 border border-sky-100 shadow-sm mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>1-Click Portfolio Demo Logins</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-3">
            Click any demo profile to authenticate instantly without typing:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('alice@student.edu', 'Student@123')}
              className="p-2.5 bg-white hover:bg-sky-100/50 border border-sky-200 rounded-xl text-left transition-all hover:scale-[1.02] shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-sky-700 font-semibold text-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Alice (Student)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">CGPA 9.1 • Computer Sci</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('bob@student.edu', 'Student@123')}
              className="p-2.5 bg-white hover:bg-sky-100/50 border border-sky-200 rounded-xl text-left transition-all hover:scale-[1.02] shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-sky-700 font-semibold text-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Bob (Student)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">CGPA 7.8 • Info Tech</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('google@recruiter.com', 'Recruiter@123')}
              className="p-2.5 bg-white hover:bg-purple-100/50 border border-purple-200 rounded-xl text-left transition-all hover:scale-[1.02] shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>Google Recruiter</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Hiring Lead • Sundar</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin@college.edu', 'Admin@123')}
              className="p-2.5 bg-white hover:bg-amber-100/50 border border-amber-200 rounded-xl text-left transition-all hover:scale-[1.02] shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TPO Admin</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Placement Cell Head</p>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New to RecruitHub?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
