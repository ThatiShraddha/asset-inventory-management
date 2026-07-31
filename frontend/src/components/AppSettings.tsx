import React, { useState } from 'react';
import { 
  User, Building2, Sliders, Shield, Trash2, RefreshCw, Layers, Sparkles, CheckCircle2
} from 'lucide-react';
import { UserSession, Department, Role } from '../types';

interface AppSettingsProps {
  currentUser: UserSession;
  departments: Department[];
  onRoleChange: (newRole: Role) => void;
  onResetDB: () => void;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function AppSettings({ 
  currentUser, departments, onRoleChange, onResetDB, triggerToast 
}: AppSettingsProps) {
  
  // Profile Form states
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileDept, setProfileDept] = useState(currentUser.departmentId);

  // Active double role switcher state helper
  const handleRoleSwap = (role: Role) => {
    onRoleChange(role);
    triggerToast(`Active workspace role dynamically switched to ${role}. Access rules re-evaluated.`, "success");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName || !profileEmail) {
      triggerToast("Please populate all profile descriptor fields.", "warning");
      return;
    }

    triggerToast("Your profile parameters have been updated in active memory storage.", "success");
  };

  const handleResetSystem = () => {
    if (confirm("WARNING: This will wipe all current transactions and reset database store to original seeds. Proceed?")) {
      onResetDB();
      triggerToast("Local localStorage sandbox database restored successfully to default seed records.", "success");
      // Hard refresh to reload state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* PROFILE SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Active User Profile</h2>
          <p className="text-xs text-slate-400 font-medium">Reconfigure your personal workspace descriptors and department assignment.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Display Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs outline-none focus:border-[#39A5AD] text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Corporate Routing Email</label>
              <input
                type="email"
                required
                disabled
                value={profileEmail}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none text-slate-400 font-medium cursor-not-allowed select-none"
                title="SAML email cannot be edited during active sessions"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Department Cost Center</label>
            <select
              value={profileDept}
              onChange={(e) => setProfileDept(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none font-semibold text-slate-600"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} (${d.budgetLimit - d.budgetConsumed} rem.)</option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
            >
              Commit Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* DYNAMIC ROLE SWITCHER (RBAC TESTBED) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">Active Role Switcher (RBAC compliance testbed)</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Toggle your active simulated workspace persona instantly to inspect dynamic permission rules and action controls.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              key: 'ADMIN', 
              emoji: '👑', 
              label: 'System & Workspace Admin', 
              desc: 'Full database admin, daily approval signoffs, budgets, and system config reset control.' 
            },
            { 
              key: 'STORE_MANAGER', 
              emoji: '📦', 
              label: 'Store Manager', 
              desc: 'Warehouse ledger, QR code generators, and maintenance schedules.' 
            },
            { 
              key: 'EMPLOYEE', 
              emoji: '👨‍💻', 
              label: 'Staff Employee', 
              desc: 'Browse inventory, request disbursements, and return held assets.' 
            },
            { 
              key: 'AUDITOR', 
              emoji: '🕵️‍♀️', 
              label: 'Compliance Auditor', 
              desc: 'Read-only access to double-signature transaction logs & report CSV exports.' 
            }
          ].map((role) => {
            const isActive = currentUser.role === role.key;

            return (
              <button
                key={role.key}
                type="button"
                onClick={() => handleRoleSwap(role.key as any)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-indigo-500 bg-indigo-50/10 shadow-sm shadow-indigo-100' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl">{role.emoji}</span>
                  {isActive ? (
                    <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE RULE
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Click to swap</span>
                  )}
                </div>

                <div className="space-y-1 mt-4">
                  <h3 className="text-xs font-black text-slate-800">{role.label}</h3>
                  <p className="text-[10px] text-slate-400 leading-normal">{role.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SYSTEM OPERATIONS AND DATABASE RESTS */}
      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <Trash2 className="w-4 h-4 text-rose-600" /> Danger Zone Operational Resets
          </h3>
          <p className="text-[11px] text-rose-600 leading-normal">System operations that rewrite storage states permanently. Useful to pristine test default seeding loops.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleResetSystem}
            className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/10"
          >
            <RefreshCw className="w-4 h-4" /> Reset Workspace Database Store
          </button>
          
          <div className="text-[10px] text-rose-500 max-w-sm flex items-center leading-normal font-medium">
            This wipes all ledger audit logs, requisitions submissions, returned records, and restores IT hardware catalog models to standard pristine starting seeds.
          </div>
        </div>
      </div>

    </div>
  );
}
