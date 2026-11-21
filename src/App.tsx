import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarHeart,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';
import { AuthSession, signOutAccount } from './utils/authApi';
import { AuthPage } from './components/auth/AuthPage';
import {
  AppState,
  Appointment,
  AssessmentRecord,
  CounselorSessionNote,
  CounselorTab,
  MoodLog,
  PrivacySettings,
  RoleMode,
  StudentTab,
  TriageLevel,
} from './types';
import { loadAppState, resetAppState, saveAppState } from './utils/storage';
import { CrisisModal } from './components/CrisisModal';
import { OverviewSection } from './components/student/OverviewSection';
import { AssessmentsSection } from './components/student/AssessmentsSection';
import { MoodTrackerSection } from './components/student/MoodTrackerSection';
import { WellnessHubSection } from './components/student/WellnessHubSection';
import { CounselorBookingSection } from './components/student/CounselorBookingSection';
import { PrivacySettingsSection } from './components/student/PrivacySettingsSection';
import { CounselorQueueSection } from './components/counselor/CounselorQueueSection';
import { CampusAnalyticsSection } from './components/counselor/CampusAnalyticsSection';

const STUDENT_NAV: {
  id: StudentTab;
  label: string;
  stepHint: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: 'overview', label: 'Overview', stepHint: 'Home', icon: LayoutDashboard },
  {
    id: 'assessments',
    label: 'Self-Assessments',
    stepHint: 'Assess',
    icon: ClipboardCheck,
  },
  { id: 'mood', label: 'Mood & Triggers', stepHint: 'Track', icon: Activity },
  { id: 'wellness', label: 'Wellness Hub', stepHint: 'Support', icon: BookOpen },
  {
    id: 'booking',
    label: 'Counselor Booking',
    stepHint: 'Connect',
    icon: CalendarHeart,
  },
  {
    id: 'privacy',
    label: 'Privacy & Profile',
    stepHint: 'Consent',
    icon: ShieldCheck,
  },
];

const COUNSELOR_NAV: {
  id: CounselorTab;
  label: string;
  icon: typeof Stethoscope;
}[] = [
  { id: 'queue', label: 'Triage & Sessions', icon: Stethoscope },
  { id: 'analytics', label: 'Campus Analytics', icon: BarChart3 },
];

function InnerBalanceMark() {
  return (
    <svg
      width="24"
      height="24"
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

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [role, setRole] = useState<RoleMode>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('overview');
  const [counselorTab, setCounselorTab] = useState<CounselorTab>('queue');
  const [isCrisisOpen, setIsCrisisOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [priorityBookingRequested, setPriorityBookingRequested] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleAuthenticated = (session: AuthSession) => {
    setAuthSession(session);
    setRole(session.user.role);
    setStudentTab('overview');
    setCounselorTab('queue');

    if (session.user.isDemo) {
      setState(loadAppState());
    } else if (session.user.role === 'student') {
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          realName: session.user.fullName,
          alias: session.user.alias,
          department: session.user.department,
          yearLabel: session.user.yearLabel,
          studentId: session.user.studentId,
          email: session.user.email,
          privacy: {
            ...prev.profile.privacy,
            aliasMode: session.user.aliasMode,
          },
        },
        appointments: prev.appointments.map((apt) =>
          apt.isCurrentStudent
            ? { ...apt, studentAlias: session.user.alias }
            : apt
        ),
      }));
    }
  };

  const handleSignOut = async () => {
    if (authSession) {
      await signOutAccount(authSession.token);
    }
    setAuthSession(null);
    setIsMobileMenuOpen(false);
    setConfirmingReset(false);
  };

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const latestTriagePriority: TriageLevel = (() => {
    const sorted = [...state.assessments].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
    return sorted[0]?.triageLevel ?? 'low';
  })();

  const urgentQueueCount = state.appointments.filter(
    (a) => a.triagePriority === 'high' && a.status === 'Upcoming'
  ).length;

  const handleSaveAssessment = (record: AssessmentRecord) => {
    setState((prev) => {
      const updatedAppointments =
        record.triageLevel === 'high'
          ? prev.appointments.map((apt) =>
              apt.isCurrentStudent && apt.status === 'Upcoming'
                ? { ...apt, triagePriority: 'high' as TriageLevel }
                : apt
            )
          : prev.appointments;

      return {
        ...prev,
        assessments: [record, ...prev.assessments],
        appointments: updatedAppointments,
      };
    });
  };

  const handleSaveMoodLog = (log: MoodLog) => {
    setState((prev) => {
      const exists = prev.moodLogs.some((m) => m.date === log.date);
      const nextLogs = exists
        ? prev.moodLogs.map((m) => (m.date === log.date ? log : m))
        : [...prev.moodLogs, log];
      return { ...prev, moodLogs: nextLogs };
    });
  };

  const handleCreateAppointment = (appointment: Appointment) => {
    setState((prev) => ({
      ...prev,
      appointments: [appointment, ...prev.appointments],
    }));
  };

  const handleRescheduleAppointment = (
    id: string,
    newDate: string,
    newTime: string
  ) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === id ? { ...a, date: newDate, time: newTime } : a
      ),
    }));
  };

  const handleCancelAppointment = (id: string) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === id ? { ...a, status: 'Cancelled' } : a
      ),
    }));
  };

  const handleMarkCompleted = (id: string) => {
    setState((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === id ? { ...a, status: 'Completed' } : a
      ),
    }));
  };

  const handleUpdatePrivacy = (privacy: PrivacySettings) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, privacy },
    }));
  };

  const handleUpdateAlias = (newAlias: string) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, alias: newAlias },
      appointments: prev.appointments.map((apt) =>
        apt.isCurrentStudent ? { ...apt, studentAlias: newAlias } : apt
      ),
      sessionNotes: prev.sessionNotes.map((note) =>
        note.studentAlias === prev.profile.alias
          ? { ...note, studentAlias: newAlias }
          : note
      ),
    }));
  };

  const handleAddSessionNote = (note: CounselorSessionNote) => {
    setState((prev) => ({
      ...prev,
      sessionNotes: [note, ...prev.sessionNotes],
    }));
  };

  const handlePriorityBookNavigate = () => {
    setRole('student');
    setPriorityBookingRequested(true);
    setStudentTab('booking');
    setIsMobileMenuOpen(false);
  };

  const handleResetDemo = () => {
    const fresh = resetAppState();
    setState(fresh);
    setConfirmingReset(false);
    setPriorityBookingRequested(false);
  };

  const currentBreadcrumb =
    role === 'student'
      ? STUDENT_NAV.find((n) => n.id === studentTab)?.label ?? 'Overview'
      : COUNSELOR_NAV.find((n) => n.id === counselorTab)?.label ?? 'Triage & Sessions';

  const activeIdentityLabel =
    role === 'student'
      ? state.profile.privacy.aliasMode
        ? state.profile.alias
        : state.profile.realName
      : authSession?.user.role === 'counselor'
      ? authSession.user.fullName
      : 'Campus Counseling Desk';

  if (!authSession) {
    return (
      <>
        <AuthPage
          onAuthenticated={handleAuthenticated}
          onOpenCrisis={() => setIsCrisisOpen(true)}
        />
        <CrisisModal
          isOpen={isCrisisOpen}
          onClose={() => setIsCrisisOpen(false)}
        />
      </>
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-[#E4E2DC]">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#E4E2DC]">
          <button
            type="button"
            onClick={() => {
              if (role === 'student') setStudentTab('overview');
              else setCounselorTab('queue');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left"
          >
            <InnerBalanceMark />
            <span className="font-display text-base font-bold tracking-tight text-[#1E292B] whitespace-nowrap shrink-0">
              Inner Balance
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-lg p-1.5 text-[#546266] hover:bg-[#F3F2EE]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1" aria-label="Primary navigation">
          {role === 'student' ? (
            <>
              <p className="px-3 pt-2 pb-1.5 text-xs font-medium text-[#7A8487]">
                Student Portal
              </p>
              {STUDENT_NAV.map((item) => {
                const Icon = item.icon;
                const active = studentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setStudentTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#EFF3EF] text-[#2F5446] font-semibold'
                        : 'text-[#546266] hover:bg-[#F8F7F4] hover:text-[#1E292B]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-[#3D6B59]' : 'text-[#7A8487]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="text-[11px] font-normal text-[#8A9497] shrink-0">
                      {item.stepHint}
                    </span>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <p className="px-3 pt-2 pb-1.5 text-xs font-medium text-[#7A8487]">
                Counselor &amp; Admin Console
              </p>
              {COUNSELOR_NAV.map((item) => {
                const Icon = item.icon;
                const active = counselorTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCounselorTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#EFF3EF] text-[#2F5446] font-semibold'
                        : 'text-[#546266] hover:bg-[#F8F7F4] hover:text-[#1E292B]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? 'text-[#3D6B59]' : 'text-[#7A8487]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.id === 'queue' && urgentQueueCount > 0 && (
                      <span className="font-mono text-xs font-semibold text-[#B42318] tabular-nums shrink-0">
                        {urgentQueueCount} urgent
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </nav>
      </div>

      {/* Bottom Profile & Reset Demo Controls */}
      <div className="p-4 border-t border-[#E4E2DC] space-y-3 bg-[#FAF9F6]">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[#1E292B] truncate">
            {activeIdentityLabel}
          </p>
          <p className="text-[11px] text-[#546266] truncate">
            {role === 'student'
              ? state.profile.privacy.aliasMode
                ? 'Alias Mode Active'
                : state.profile.studentId
              : 'Verified Campus Clinical Staff'}
          </p>
        </div>

        {confirmingReset ? (
          <div className="rounded-lg border border-[#E4E2DC] bg-white p-2.5 space-y-2">
            <p className="text-[11px] text-[#546266]">
              Restore pre-populated demo data?
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex-1 rounded-md bg-[#3D6B59] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#2F5446]"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="flex-1 rounded-md border border-[#D4D9D5] bg-white px-2 py-1 text-[11px] font-medium text-[#546266]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E4E2DC] bg-white px-3 py-1.5 text-xs font-medium text-[#546266] hover:text-[#1E292B] hover:bg-[#F3F2EE] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Demo Data
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E4E2DC] bg-white px-3 py-1.5 text-xs font-medium text-[#546266] hover:text-[#B42318] hover:border-[#F3C5C1] hover:bg-[#FEF6F5] transition-colors whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F7F4] text-[#1E292B]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#1E292B]/40 backdrop-blur-[1px]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[82vw] h-full">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E4E2DC] px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Zone 1: Menu + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden rounded-lg p-2 text-[#546266] hover:bg-[#F3F2EE] hover:text-[#1E292B] shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0 truncate">
              <span className="hidden sm:inline text-[#7A8487] whitespace-nowrap">
                {role === 'student' ? 'Student Portal' : 'Counselor Console'}
              </span>
              <span className="hidden sm:inline text-[#C5C9C6]" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-[#1E292B] truncate">
                {currentBreadcrumb}
              </span>
            </div>
          </div>

          {/* Zone 2 & 3: Role Switcher (Demo Mode) + Persistent Crisis Helplines CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {authSession.user.isDemo ? (
              <div
                className="inline-flex items-center rounded-lg bg-[#F3F2EE] p-1 border border-[#E4E2DC]"
                role="tablist"
                aria-label="Switch portal role"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={role === 'student'}
                  onClick={() => setRole('student')}
                  className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    role === 'student'
                      ? 'bg-white text-[#1E292B] shadow-xs'
                      : 'text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={role === 'counselor'}
                  onClick={() => setRole('counselor')}
                  className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    role === 'counselor'
                      ? 'bg-white text-[#1E292B] shadow-xs'
                      : 'text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  Counselor View
                </button>
              </div>
            ) : (
              <span className="hidden sm:inline text-xs font-medium text-[#546266] whitespace-nowrap shrink-0">
                {activeIdentityLabel}
              </span>
            )}

            {/* Persistent High-Visibility Crisis Helplines Button */}
            <button
              type="button"
              onClick={() => setIsCrisisOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#B42318] px-3 sm:px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#912018] transition-colors whitespace-nowrap shrink-0"
            >
              <PhoneCall className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">Need Urgent Help? Crisis Helplines</span>
              <span className="md:hidden">Crisis Help</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Viewport */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {role === 'student' ? (
            <>
              {studentTab === 'overview' && (
                <OverviewSection
                  state={state}
                  onNavigate={setStudentTab}
                  onOpenCrisis={() => setIsCrisisOpen(true)}
                />
              )}
              {studentTab === 'assessments' && (
                <AssessmentsSection
                  assessments={state.assessments}
                  onSaveAssessment={handleSaveAssessment}
                  onNavigate={setStudentTab}
                  onPriorityBook={handlePriorityBookNavigate}
                  onOpenCrisis={() => setIsCrisisOpen(true)}
                />
              )}
              {studentTab === 'mood' && (
                <MoodTrackerSection
                  moodLogs={state.moodLogs}
                  onSaveMoodLog={handleSaveMoodLog}
                />
              )}
              {studentTab === 'wellness' && <WellnessHubSection />}
              {studentTab === 'booking' && (
                <CounselorBookingSection
                  studentAlias={state.profile.alias}
                  appointments={state.appointments}
                  defaultTriagePriority={latestTriagePriority}
                  priorityModeRequested={priorityBookingRequested}
                  onClearPriorityRequest={() => setPriorityBookingRequested(false)}
                  onCreateAppointment={handleCreateAppointment}
                  onRescheduleAppointment={handleRescheduleAppointment}
                  onCancelAppointment={handleCancelAppointment}
                />
              )}
              {studentTab === 'privacy' && (
                <PrivacySettingsSection
                  profile={state.profile}
                  onUpdatePrivacy={handleUpdatePrivacy}
                  onUpdateAlias={handleUpdateAlias}
                />
              )}
            </>
          ) : (
            <>
              {counselorTab === 'queue' && (
                <CounselorQueueSection
                  state={state}
                  onAddSessionNote={handleAddSessionNote}
                  onMarkCompleted={handleMarkCompleted}
                />
              )}
              {counselorTab === 'analytics' && (
                <CampusAnalyticsSection state={state} />
              )}
            </>
          )}

          {/* Subtle Medical Disclaimer Footer */}
          <footer className="mt-12 pt-5 border-t border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6B767A]">
            <p>
              Inner Balance supports mental-health access and self-monitoring; it does not replace professional medical advice or emergency care.
            </p>
            <button
              type="button"
              onClick={() => setIsCrisisOpen(true)}
              className="text-left sm:text-right font-medium text-[#B42318] hover:underline whitespace-nowrap shrink-0"
            >
              24/7 Helplines (Tele-MANAS 14416)
            </button>
          </footer>
        </main>
      </div>

      {/* Persistent Crisis Helplines Modal */}
      <CrisisModal
        isOpen={isCrisisOpen}
        onClose={() => setIsCrisisOpen(false)}
        onBookPriority={handlePriorityBookNavigate}
      />
    </div>
  );
}
