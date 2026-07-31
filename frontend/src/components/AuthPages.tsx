import React, { useState } from 'react';
import { 
  ArrowLeft, Mail, Lock, User, Building2, ShieldCheck, CheckCircle2, UserCheck, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { SIMULATED_USERS, loginUser } from '../data/dbStore';
import { UserSession } from '../types';

interface AuthPagesProps {
  onBackToMarketing: () => void;
  onLoginSuccess: (user: UserSession) => void;
  triggerToast: (msg: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function AuthPages({ onBackToMarketing, onLoginSuccess, triggerToast }: AuthPagesProps) {
  // Navigation states: 'login' | 'register' | 'forgot' | 'reset' | 'verify'
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup Multi-Step States (Step 1: Company Info, Step 2: Seat Allocation, Step 3: Admin Account)
  const [signUpStep, setSignUpStep] = useState(1);
  const [signupCompany, setSignupCompany] = useState('');
  const [signupDomain, setSignupDomain] = useState('');
  const [signupSeats, setSignupSeats] = useState(25);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Forgot / Reset Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPass1, setResetPass1] = useState('');
  const [resetPass2, setResetPass2] = useState('');

  // Email Verification States
  const [verificationPin, setVerificationPin] = useState(['', '', '', '']);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Corporate active directory email and passcode are required.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setLoginError('Invalid corporate routing email format.');
      return;
    }

    const result = await loginUser(loginEmail.trim(), loginPassword);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
      triggerToast(`Authentication validated. Logged in as ${result.user.name} (${result.user.role})`, "success");
    } else {
      setLoginError(result.error || 'Identity denied. Corporate credentials not recognized in EIMS records.');
    }
  };

  const selectSimulatedPersona = (personaEmail: string) => {
    const user = SIMULATED_USERS.find(u => u.email === personaEmail);
    if (user) {
      setLoginEmail(user.email);
      setLoginPassword('secret-passkey'); // prefill passcode
      triggerToast(`Prefilled credentials for ${user.name} (${user.role})`, "info");
    }
  };

  const handleRegisterNext = () => {
    if (signUpStep === 1) {
      if (!signupCompany || !signupDomain) {
        triggerToast("Please enter your organization profile.", "warning");
        return;
      }
      setSignUpStep(2);
    } else if (signUpStep === 2) {
      setSignUpStep(3);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      triggerToast("Please populate all security account fields.", "warning");
      return;
    }

    // Transition to verification stage
    triggerToast("Workspace profile cataloged. Email verification token dispatched.", "success");
    setAuthView('verify');
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const joinedPin = verificationPin.join('');
    if (joinedPin.length < 4) {
      triggerToast("Please input the complete 4-digit verification token.", "warning");
      return;
    }

    // Success login mock
    triggerToast("Email verification verified successfully! Launching default Workspace Admin.", "success");
    // Login as Sarah Jenkins (Admin)
    const adminUser = SIMULATED_USERS[0];
    onLoginSuccess(adminUser);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      triggerToast("Please provide your workspace email address.", "warning");
      return;
    }
    triggerToast(`Password reset link successfully routed to ${forgotEmail}.`, "success");
    setAuthView('reset');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPass1 || resetPass1.length < 6) {
      triggerToast("Passcode must be at least 6 characters in length.", "warning");
      return;
    }
    if (resetPass1 !== resetPass2) {
      triggerToast("Security passcodes do not match.", "error");
      return;
    }
    triggerToast("Your corporate active directory passcode has been updated.", "success");
    setAuthView('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between py-12 px-6 select-none relative overflow-hidden">
      
      {/* Background soft glow lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#39A5AD]/5 to-[#39A5AD]/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/5 to-violet-500/10 blur-[150px]" />
      </div>

      {/* Header Back Link */}
      <header className="max-w-md w-full mx-auto relative z-10 flex items-center justify-between">
        <button
          onClick={onBackToMarketing}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product Site
        </button>
        <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-400 px-2.5 py-1 rounded-md shadow-sm">
          SECURE SHIELD CONNECT
        </span>
      </header>

      {/* Central Interactive Content Area */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 p-8 space-y-6">
          
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5 justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#39A5AD] flex items-center justify-center text-white shadow-sm shadow-[#39A5AD]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">AssetFlow ID Gateway</span>
          </div>

          {/* VIEW: LOGIN SCREEN */}
          {authView === 'login' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Sign In</h2>
                <p className="text-xs text-slate-400 mt-1">Authenticate using your corporate workspace account.</p>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs p-3 rounded-xl flex items-start gap-2.5">
                  <span className="font-bold uppercase tracking-wider text-[10px] bg-rose-200/50 text-rose-700 px-1 py-0.5 rounded shrink-0">Denied</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">active directory email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="s.jenkins@enterprise.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs outline-none focus:border-[#39A5AD] focus:ring-1 focus:ring-[#39A5AD] transition-all text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">gateway security passkey</label>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot')}
                      className="text-[10px] font-bold text-[#39A5AD] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 pr-10 text-xs outline-none focus:border-[#39A5AD] focus:ring-1 focus:ring-[#39A5AD] transition-all text-slate-800 placeholder-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-[#39A5AD]/10 transition-all cursor-pointer"
                >
                  Verify Authenticity & Connect
                </button>
              </form>

              {/* SIMULATED ROLE SWAP ROW */}
              <div className="border-t border-slate-100 pt-5 space-y-3 bg-slate-50/50 p-4 rounded-xl border max-h-[310px] overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block sticky top-0 bg-slate-50 py-0.5 z-10">
                  Select Simulated Demo Persona:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => selectSimulatedPersona('a.wright@enterprise.com')}
                    className="w-full flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👑</span>
                      <div className="text-left">
                        <span className="block text-slate-900 leading-tight">Alexander Wright (Admin)</span>
                        <span className="text-[9px] text-slate-400 font-medium">Unrestricted administration & configuration controls</span>
                      </div>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => selectSimulatedPersona('e.rostova@enterprise.com')}
                    className="w-full flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📦</span>
                      <div className="text-left">
                        <span className="block text-slate-900 leading-tight">Elena Rostova (Store Manager)</span>
                        <span className="text-[9px] text-slate-400 font-medium">Warehouse logs, QR & maintenance</span>
                      </div>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => selectSimulatedPersona('m.thorne@enterprise.com')}
                    className="w-full flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">👨‍💻</span>
                      <div className="text-left">
                        <span className="block text-slate-900 leading-tight">Marcus Thorne (Employee)</span>
                        <span className="text-[9px] text-slate-400 font-medium font-normal">Browse assets & request checkout</span>
                      </div>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => selectSimulatedPersona('d.prince@enterprise.com')}
                    className="w-full flex items-center justify-between bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🕵️‍♀️</span>
                      <div className="text-left">
                        <span className="block text-slate-900 leading-tight">Diana Prince (Auditor)</span>
                        <span className="text-[9px] text-slate-400 font-medium">Read-only logs & reports export</span>
                      </div>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 pt-2">
                Need to create a new workspace?{' '}
                <button
                  onClick={() => { setAuthView('register'); setSignUpStep(1); }}
                  className="font-extrabold text-[#39A5AD] hover:underline cursor-pointer"
                >
                  Register organization
                </button>
              </div>
            </div>
          )}

          {/* VIEW: REGISTER MULTI-STEP */}
          {authView === 'register' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Register Organization</h2>
                <p className="text-xs text-slate-400 mt-1">Set up your private enterprise tenant.</p>
              </div>

              {/* Progress Bar steps */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      signUpStep === step 
                        ? 'bg-[#39A5AD] text-white' 
                        : signUpStep > step 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {signUpStep > step ? "✓" : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-8 h-0.5 ml-2 ${signUpStep > step ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {signUpStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Organization Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Global Operations Corp"
                          value={signupCompany}
                          onChange={(e) => setSignupCompany(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs outline-none focus:border-[#39A5AD] text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Corporate Domain Alias</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-mono font-bold">@</span>
                        <input
                          type="text"
                          required
                          placeholder="globalcorp.com"
                          value={signupDomain}
                          onChange={(e) => setSignupDomain(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-8 text-xs outline-none focus:border-[#39A5AD] text-slate-800 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {signUpStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Selected Seat Capacity Plan:</span>
                      <div className="text-3xl font-black text-[#39A5AD]">{signupSeats} Active Seats</div>
                      <input
                        type="range"
                        min="5"
                        max="250"
                        value={signupSeats}
                        onChange={(e) => setSignupSeats(parseInt(e.target.value))}
                        className="w-full accent-[#39A5AD] cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 block leading-tight">Can be resized dynamically via billing manager settings.</span>
                    </div>
                  </div>
                )}

                {signUpStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Primary Administrator Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Sarah Jenkins"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs outline-none focus:border-[#39A5AD]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Corporate Routing Email</label>
                      <input
                        type="email"
                        required
                        placeholder="s.jenkins@globalcorp.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Secret Access Passcode</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {signUpStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setSignUpStep(signUpStep - 1)}
                      className="w-1/3 border border-slate-200 text-slate-600 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {signUpStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleRegisterNext}
                      className={`font-extrabold text-xs py-3 rounded-xl text-white bg-[#39A5AD] hover:bg-[#2D8E95] cursor-pointer ${
                        signUpStep > 1 ? 'w-2/3' : 'w-full'
                      }`}
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      className="w-2/3 bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer"
                    >
                      Provision Tenant
                    </button>
                  )}
                </div>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2">
                Already registered your tenant?{' '}
                <button
                  onClick={() => setAuthView('login')}
                  className="font-extrabold text-[#39A5AD] hover:underline cursor-pointer"
                >
                  Sign in instead
                </button>
              </div>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {authView === 'forgot' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Recover Passkey</h2>
                <p className="text-xs text-slate-400 mt-1">Request a gateway override token.</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Corporate Routing Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="s.jenkins@enterprise.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-xs outline-none focus:border-[#39A5AD]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3.5 rounded-xl cursor-pointer"
                >
                  Send Recovery Link
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-2">
                Remembered password?{' '}
                <button
                  onClick={() => setAuthView('login')}
                  className="font-extrabold text-[#39A5AD] hover:underline cursor-pointer"
                >
                  Return to sign in
                </button>
              </div>
            </div>
          )}

          {/* VIEW: RESET PASSWORD */}
          {authView === 'reset' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Configure New Passkey</h2>
                <p className="text-xs text-slate-400 mt-1">Your identity was verified with simulated override token.</p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">New Gateway passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={resetPass1}
                    onChange={(e) => setResetPass1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Confirm gateway passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={resetPass2}
                    onChange={(e) => setResetPass2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#39A5AD]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3.5 rounded-xl cursor-pointer"
                >
                  Commit gateway passcode
                </button>
              </form>
            </div>
          )}

          {/* VIEW: EMAIL PIN VERIFICATION */}
          {authView === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Verification</h2>
                <p className="text-xs text-slate-400 mt-1">We dispatched a 4-digit security PIN token.</p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      required
                      value={verificationPin[idx]}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const nextPin = [...verificationPin];
                        nextPin[idx] = val;
                        setVerificationPin(nextPin);
                        
                        // Auto focus next input
                        if (val && idx < 3) {
                          const nextEl = document.getElementById(`pin-${idx + 1}`);
                          if (nextEl) nextEl.focus();
                        }
                      }}
                      id={`pin-${idx}`}
                      className="w-12 h-14 bg-slate-50 border-2 border-slate-200 text-center text-lg font-black rounded-xl outline-none focus:border-[#39A5AD] text-slate-900"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#39A5AD] hover:bg-[#2D8E95] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm Identity & Bind Account
                </button>
              </form>

              <div className="text-center text-xs text-slate-500">
                Didn't receive PIN token?{' '}
                <button
                  type="button"
                  onClick={() => triggerToast("Simulated verification token re-dispatched.", "success")}
                  className="font-extrabold text-[#39A5AD] hover:underline cursor-pointer"
                >
                  Resend token
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer credits */}
      <footer className="text-center text-[10px] text-slate-400 relative z-10">
        © 2026 AssetFlow ID Gateway v2.1. Standard TLS 1.3 Active Direct Encryption Active.
      </footer>

    </div>
  );
}
