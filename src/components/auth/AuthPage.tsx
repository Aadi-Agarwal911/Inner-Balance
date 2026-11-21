import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { RoleMode } from '../../types';
import {
  AuthSession,
  signInAccount,
  signInDemoRole,
  signUpAccount,
} from '../../utils/authApi';

interface AuthPageProps {
  onAuthenticated: (session: AuthSession) => void;
  onOpenCrisis: () => void;
  initialMode?: 'signin' | 'signup';
}

function InnerBalanceLogoMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="24" height="24" rx="7" fill="#3D6B59" />
      <path
        d="M12 6.2C9.2 8.1 7.6 10.6 7.6 13.4C7.6 15.8 9.6 17.8 12 17.8C14.4 17.8 16.4 15.8 16.4 13.4C16.4 10.6 14.8 8.1 12 6.2Z"
        stroke="#F8F7F4"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5V17.6"
        stroke="#F8F7F4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthPage({
  onAuthenticated,
  onOpenCrisis,
  initialMode = 'signin',
}: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<RoleMode | null>(null);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up state
  const [signUpRole, setSignUpRole] = useState<RoleMode>('student');
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [department, setDepartment] = useState('');
  const [yearLabel, setYearLabel] = useState('2nd Year · Semester 4');
  const [studentId, setStudentId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [alias, setAlias] = useState('User_Sage_42');
  const [aliasMode, setAliasMode] = useState(true);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const hasMinLen = signUpPassword.length >= 8;
  const hasLetterAndNum = /[A-Za-z]/.test(signUpPassword) && /\d/.test(signUpPassword);
  const passwordsMatch =
    signUpPassword.length > 0 && signUpPassword === confirmPassword;

  const switchMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setError(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await signInAccount(signInEmail, signInPassword);
      onAuthenticated(session);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLen || !hasLetterAndNum) {
      setError(
        'Please choose a password with at least 8 characters including a letter and a number.'
      );
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }
    if (!consentAccepted) {
      setError(
        'Please confirm that you understand Inner Balance does not replace emergency medical care.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await signUpAccount({
        fullName,
        email: signUpEmail,
        password: signUpPassword,
        role: signUpRole,
        department,
        yearLabel: signUpRole === 'student' ? yearLabel : 'Campus Clinical Staff',
        studentId,
        specialization: signUpRole === 'counselor' ? specialization : undefined,
        alias: signUpRole === 'student' ? alias : undefined,
        aliasMode: signUpRole === 'student' ? aliasMode : false,
      });
      onAuthenticated(session);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create account. Please review your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async (role: RoleMode) => {
    setError(null);
    setDemoLoadingRole(role);
    try {
      const session = await signInDemoRole(role);
      onAuthenticated(session);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to open demo workspace.'
      );
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1E292B]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E4E2DC] px-4 sm:px-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <InnerBalanceLogoMark />
          <span className="font-display text-base font-bold tracking-tight text-[#1E292B]">
            Inner Balance
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenCrisis}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#B42318] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#912018] transition-colors whitespace-nowrap shrink-0"
        >
          <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Need Urgent Help? Crisis Helplines</span>
          <span className="sm:hidden">Crisis Help</span>
        </button>
      </header>

      {/* Main Split Workspace */}
      <main className="flex-1 w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Clinical-Wellness Context & Privacy Architecture */}
          <section className="lg:col-span-5 rounded-xl border border-[#DCE5DD] bg-[#EFF3EF] p-6 sm:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#3D6B59]">
                  Campus Mental Health &amp; Psychological Support
                </p>
                <h1 className="mt-2.5 text-2xl sm:text-3xl font-semibold tracking-tight text-[#1E292B] leading-tight">
                  Confidential psychological support, built for university life.
                </h1>
                <p className="mt-3 text-sm text-[#435457] leading-relaxed">
                  Follow a calm, structured pathway—Assess, Understand, Support, Connect, and Track—with deterministic clinical screeners and verified human campus counselors.
                </p>
              </div>

              <div className="divide-y divide-[#D7E1D9] border-t border-b border-[#D7E1D9]">
                <div className="py-3.5">
                  <p className="text-sm font-semibold text-[#1E292B]">
                    Pseudonymized Alias Mode
                  </p>
                  <p className="mt-1 text-xs text-[#435457] leading-relaxed">
                    Use self-assessments, mood logs, and wellness tools under an alias like{' '}
                    <span className="font-mono font-medium text-[#2F5446]">User_Alpha_8</span>.
                  </p>
                </div>
                <div className="py-3.5">
                  <p className="text-sm font-semibold text-[#1E292B]">
                    Granular Counselor Consent
                  </p>
                  <p className="mt-1 text-xs text-[#435457] leading-relaxed">
                    You decide whether your assigned psychologist can preview PHQ-9, GAD-7, or 14-day mood trends before a session.
                  </p>
                </div>
                <div className="py-3.5">
                  <p className="text-sm font-semibold text-[#1E292B]">
                    Rule-Based Human Care Triage
                  </p>
                  <p className="mt-1 text-xs text-[#435457] leading-relaxed">
                    Standardized scoring thresholds connect urgent risk directly to campus clinicians and 24/7 national helplines—zero automated diagnosis.
                  </p>
                </div>
              </div>
            </div>

            {/* Evaluator Quick Demo Access */}
            <div className="rounded-lg border border-[#D4DFD6] bg-white/85 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#1E292B]">
                  Quick Demo Access
                </p>
                <p className="mt-0.5 text-xs text-[#546266]">
                  Explore the pre-populated campus dataset immediately without creating an account.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  type="button"
                  disabled={demoLoadingRole !== null || isSubmitting}
                  onClick={() => handleDemoAccess('student')}
                  className="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-[#C8D6CC] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E292B] hover:bg-[#F3F8F5] hover:border-[#3D6B59] disabled:opacity-50 transition-colors"
                >
                  <span className="inline-flex items-center gap-2 min-w-0 truncate">
                    <UserRound className="h-4 w-4 text-[#3D6B59] shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {demoLoadingRole === 'student'
                        ? 'Opening Student Portal...'
                        : 'Demo Student (User_Alpha_8)'}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#3D6B59] shrink-0" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  disabled={demoLoadingRole !== null || isSubmitting}
                  onClick={() => handleDemoAccess('counselor')}
                  className="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-[#C8D6CC] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E292B] hover:bg-[#F3F8F5] hover:border-[#4B6B8A] disabled:opacity-50 transition-colors"
                >
                  <span className="inline-flex items-center gap-2 min-w-0 truncate">
                    <Stethoscope className="h-4 w-4 text-[#4B6B8A] shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {demoLoadingRole === 'counselor'
                        ? 'Opening Counselor Console...'
                        : 'Demo Campus Counselor'}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#4B6B8A] shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: Sign In / Create Account Form */}
          <section className="lg:col-span-7 rounded-xl border border-[#E4E2DC] bg-white p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Mode Switcher */}
              <div
                className="grid grid-cols-2 rounded-lg bg-[#F3F2EE] p-1 border border-[#E4E2DC]"
                role="tablist"
                aria-label="Authentication mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signin'}
                  onClick={() => switchMode('signin')}
                  className={`rounded-md py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                    mode === 'signin'
                      ? 'bg-white text-[#1E292B] shadow-xs'
                      : 'text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => switchMode('signup')}
                  className={`rounded-md py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                    mode === 'signup'
                      ? 'bg-white text-[#1E292B] shadow-xs'
                      : 'text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#F3C5C1] bg-[#FEF6F5] px-4 py-3 text-xs text-[#912018]"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#B42318]" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {mode === 'signin' ? (
                <form onSubmit={handleSignInSubmit} className="mt-6 space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1E292B]">
                      Sign in to your account
                    </h2>
                    <p className="mt-1 text-sm text-[#546266]">
                      Use your registered campus email and password to access your private wellness portal or counselor console.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-email"
                      className="block text-xs font-medium text-[#1E292B]"
                    >
                      University Email
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@campus.edu"
                      className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3.5 py-2.5 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-password"
                      className="block text-xs font-medium text-[#1E292B]"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signin-password"
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-[#D4D9D5] bg-white pl-3.5 pr-10 py-2.5 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword((v) => !v)}
                        aria-label={
                          showSignInPassword ? 'Hide password' : 'Show password'
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#546266] hover:text-[#1E292B]"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || demoLoadingRole !== null}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B59] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2F5446] disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <div className="pt-4 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#546266]">
                    <span>New to Inner Balance?</span>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-semibold text-[#3D6B59] hover:text-[#2F5446] text-left sm:text-right"
                    >
                      Create a confidential campus account →
                    </button>
                  </div>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form onSubmit={handleSignUpSubmit} className="mt-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#1E292B]">
                      Create a confidential account
                    </h2>
                    <p className="mt-1 text-xs text-[#546266]">
                      Choose your campus role and configure your pseudonymized alias before entering.
                    </p>
                  </div>

                  {/* Role selector */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-medium text-[#1E292B]">
                      Campus Role
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSignUpRole('student')}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          signUpRole === 'student'
                            ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#2F5446]'
                            : 'border-[#E4E2DC] bg-white text-[#546266] hover:text-[#1E292B]'
                        }`}
                      >
                        <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                        University Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignUpRole('counselor')}
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                          signUpRole === 'counselor'
                            ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#2F5446]'
                            : 'border-[#E4E2DC] bg-white text-[#546266] hover:text-[#1E292B]'
                        }`}
                      >
                        <Stethoscope className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Campus Counselor
                      </button>
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="signup-name"
                        className="block text-xs font-medium text-[#1E292B]"
                      >
                        Full Name
                      </label>
                      <input
                        id="signup-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={
                          signUpRole === 'counselor'
                            ? 'Dr. Priya Verma'
                            : 'Riya Sharma'
                        }
                        className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="signup-email"
                        className="block text-xs font-medium text-[#1E292B]"
                      >
                        University Email
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="you@campus.edu"
                        className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Role-specific metadata */}
                  {signUpRole === 'student' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label
                            htmlFor="signup-dept"
                            className="block text-xs font-medium text-[#1E292B]"
                          >
                            Department / Program
                          </label>
                          <input
                            id="signup-dept"
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="e.g., B.Tech Electrical Engineering"
                            className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="signup-year"
                            className="block text-xs font-medium text-[#1E292B]"
                          >
                            Year &amp; Semester
                          </label>
                          <select
                            id="signup-year"
                            value={yearLabel}
                            onChange={(e) => setYearLabel(e.target.value)}
                            className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] focus:border-[#3D6B59] focus:outline-none"
                          >
                            <option value="1st Year · Semester 2">1st Year · Semester 2</option>
                            <option value="2nd Year · Semester 4">2nd Year · Semester 4</option>
                            <option value="3rd Year · Semester 6">3rd Year · Semester 6</option>
                            <option value="4th Year · Semester 8">4th Year · Semester 8</option>
                            <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                          </select>
                        </div>
                      </div>

                      {/* Privacy-First Alias Onboarding */}
                      <div className="rounded-lg border border-[#DCE5DD] bg-[#F6FAF7] p-3.5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-[#1E292B] inline-flex items-center gap-1.5">
                              <Lock className="h-3.5 w-3.5 text-[#3D6B59]" aria-hidden="true" />
                              Privacy-First Alias Onboarding
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#546266]">
                              Hide your legal name behind a pseudonymized ID in self-help modules.
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={aliasMode}
                            aria-label="Enable Alias Mode by default"
                            onClick={() => setAliasMode((v) => !v)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                              aliasMode ? 'bg-[#3D6B59]' : 'bg-[#C8CFCB]'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                aliasMode ? 'translate-x-5.5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label
                              htmlFor="signup-alias"
                              className="block text-[11px] font-medium text-[#546266]"
                            >
                              Pseudonymized Alias
                            </label>
                            <input
                              id="signup-alias"
                              type="text"
                              maxLength={28}
                              value={alias}
                              onChange={(e) => setAlias(e.target.value)}
                              placeholder="User_Sage_42"
                              className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-1.5 text-xs font-mono text-[#1E292B] focus:border-[#3D6B59] focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label
                              htmlFor="signup-roll"
                              className="block text-[11px] font-medium text-[#546266]"
                            >
                              Campus Roll ID (Optional)
                            </label>
                            <input
                              id="signup-roll"
                              type="text"
                              maxLength={24}
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              placeholder="e.g., EE24B019"
                              className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-1.5 text-xs font-mono text-[#1E292B] focus:border-[#3D6B59] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-unit"
                          className="block text-xs font-medium text-[#1E292B]"
                        >
                          Campus Unit / Center
                        </label>
                        <input
                          id="signup-unit"
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="Student Wellness Center"
                          className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="signup-spec"
                          className="block text-xs font-medium text-[#1E292B]"
                        >
                          Clinical Specialization
                        </label>
                        <input
                          id="signup-spec"
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g., Academic Stress & Burnout"
                          className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="signup-password"
                        className="block text-xs font-medium text-[#1E292B]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="signup-password"
                          type={showSignUpPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min. 8 chars"
                          className="w-full rounded-lg border border-[#D4D9D5] bg-white pl-3 pr-9 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword((v) => !v)}
                          aria-label={
                            showSignUpPassword ? 'Hide password' : 'Show password'
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#546266] hover:text-[#1E292B]"
                        >
                          {showSignUpPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="signup-confirm"
                        className="block text-xs font-medium text-[#1E292B]"
                      >
                        Confirm Password
                      </label>
                      <input
                        id="signup-confirm"
                        type={showSignUpPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password Requirements Inline Status */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        hasMinLen ? 'text-[#2E6B52] font-medium' : 'text-[#7A8487]'
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      8+ characters
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        hasLetterAndNum ? 'text-[#2E6B52] font-medium' : 'text-[#7A8487]'
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Letter &amp; number
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        passwordsMatch ? 'text-[#2E6B52] font-medium' : 'text-[#7A8487]'
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Passwords match
                    </span>
                  </div>

                  {/* Consent checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="mt-0.5 accent-[#3D6B59]"
                    />
                    <span className="text-xs text-[#546266] leading-relaxed">
                      I understand Inner Balance supports mental-health self-monitoring and campus counseling access, and does not replace professional medical advice or emergency care.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || demoLoadingRole !== null}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B59] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2F5446] disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting
                      ? 'Creating account...'
                      : 'Create Confidential Account'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#546266]">
                    <span>Already registered?</span>
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="font-semibold text-[#3D6B59] hover:text-[#2F5446]"
                    >
                      Sign in instead →
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#EFECE6] flex items-center gap-2 text-[11px] text-[#6B767A]">
              <ShieldCheck className="h-4 w-4 text-[#3D6B59] shrink-0" aria-hidden="true" />
              <span>
                Credentials are hashed server-side and active sessions use memory-only signed tokens.
              </span>
            </div>
          </section>
        </div>

        {/* Subtle Medical Disclaimer Footer */}
        <footer className="mt-10 pt-5 border-t border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6B767A]">
          <p>
            Inner Balance supports mental-health access and self-monitoring; it does not replace professional medical advice or emergency care.
          </p>
          <button
            type="button"
            onClick={onOpenCrisis}
            className="text-left sm:text-right font-medium text-[#B42318] hover:underline whitespace-nowrap shrink-0"
          >
            24/7 Helplines (Tele-MANAS 14416)
          </button>
        </footer>
      </main>
    </div>
  );
}
