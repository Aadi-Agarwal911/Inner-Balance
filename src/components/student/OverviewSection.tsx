import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  Flame,
  HeartHandshake,
  Lock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AppState, StudentTab } from '../../types';
import { computeMoodStreak, formatFullDate, formatShortDate } from '../../utils/storage';
import { TriageIndicator } from '../TriageBadge';

interface OverviewSectionProps {
  state: AppState;
  onNavigate: (tab: StudentTab) => void;
  onOpenCrisis: () => void;
}

export function OverviewSection({
  state,
  onNavigate,
  onOpenCrisis,
}: OverviewSectionProps) {
  const { profile, assessments, moodLogs, appointments } = state;
  const displayName = profile.privacy.aliasMode ? profile.alias : profile.realName;

  const sortedAssessments = [...assessments].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );
  const latestAssessment = sortedAssessments[0];

  const sortedMoods = [...moodLogs].sort((a, b) => b.date.localeCompare(a.date));
  const recent7 = sortedMoods.slice(0, 7);
  const avgMood7 =
    recent7.length > 0
      ? (recent7.reduce((sum, l) => sum + l.moodScore, 0) / recent7.length).toFixed(1)
      : '—';
  const avgSleep7 =
    recent7.length > 0
      ? (recent7.reduce((sum, l) => sum + l.sleepHours, 0) / recent7.length).toFixed(1)
      : '—';

  const streak = computeMoodStreak(moodLogs);
  const nextAppointment = appointments
    .filter((a) => a.isCurrentStudent && a.status === 'Upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const workflowSteps: {
    stepNumber: string;
    title: string;
    subtitle: string;
    statusText: string;
    tab: StudentTab;
    actionLabel: string;
  }[] = [
    {
      stepNumber: '01',
      title: 'Assess',
      subtitle: 'Complete validated PHQ-9, GAD-7, or PSS-10 screeners.',
      statusText: `${assessments.length} completed`,
      tab: 'assessments',
      actionLabel: 'Take Screener',
    },
    {
      stepNumber: '02',
      title: 'Understand',
      subtitle: 'Review deterministic severity tiers and clear next steps.',
      statusText: latestAssessment
        ? `${latestAssessment.type}: ${latestAssessment.score}/${latestAssessment.maxScore}`
        : 'No score yet',
      tab: 'assessments',
      actionLabel: 'View Scores',
    },
    {
      stepNumber: '03',
      title: 'Support',
      subtitle: 'Use 4-7-8 breathing, grounding tools, and campus guides.',
      statusText: '8 curated modules',
      tab: 'wellness',
      actionLabel: 'Open Hub',
    },
    {
      stepNumber: '04',
      title: 'Connect',
      subtitle: 'Schedule confidential sessions with campus counselors.',
      statusText: nextAppointment
        ? `Next: ${formatShortDate(nextAppointment.date)}`
        : 'Slots available',
      tab: 'booking',
      actionLabel: 'Book Session',
    },
    {
      stepNumber: '05',
      title: 'Track',
      subtitle: 'Log daily mood, sleep quality, and academic stressors.',
      statusText: `${streak}-day streak`,
      tab: 'mood',
      actionLabel: 'Log Check-In',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero / Welcome Section */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#546266]">
              <span>Student Wellness Portal</span>
              <span aria-hidden="true">·</span>
              <span>{profile.department}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#3D6B59] font-medium">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {profile.privacy.aliasMode
                  ? `Alias Mode Active (${profile.alias})`
                  : 'Standard Profile View'}
              </span>
            </div>
            <h1 className="mt-2.5 text-2xl md:text-3xl font-semibold tracking-tight text-[#1E292B]">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-2 text-sm md:text-base text-[#546266] leading-relaxed">
              Check in with yourself at your own pace. Track daily emotional patterns, complete structured self-screeners, or connect confidentially with verified campus counselors.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('mood')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3D6B59] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0"
            >
              Log Today&apos;s Check-In
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('assessments')}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D4D9D5] bg-[#F8F7F4] px-4 py-2.5 text-sm font-medium text-[#1E292B] hover:bg-[#EFF3EF] transition-colors whitespace-nowrap shrink-0"
            >
              Start Self-Assessment
            </button>
          </div>
        </div>

        {/* High-risk safety alert banner if latest assessment is high */}
        {latestAssessment && latestAssessment.triageLevel === 'high' && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-[#F3C5C1] bg-[#FEF6F5] px-4 py-3.5">
            <div className="space-y-0.5">
              <TriageIndicator
                level="high"
                customLabel={`Priority Attention Recommended (${latestAssessment.type}: ${latestAssessment.score}/${latestAssessment.maxScore})`}
              />
              <p className="text-xs text-[#546266]">
                Your most recent screening score crossed our urgent support threshold. Immediate human help is available 24/7.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenCrisis}
                className="rounded-lg bg-[#B42318] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#912018] transition-colors whitespace-nowrap shrink-0"
              >
                Crisis Helplines
              </button>
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="rounded-lg border border-[#B42318]/30 bg-white px-3.5 py-2 text-xs font-semibold text-[#B42318] hover:bg-[#FEF0EE] transition-colors whitespace-nowrap shrink-0"
              >
                Priority Booking
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4-Column Key Wellness Metrics Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>7-Day Mood Average</span>
            <TrendingUp className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
              {avgMood7}
            </span>
            <span className="text-xs text-[#546266]">/ 10 valence</span>
          </div>
          <p className="mt-1.5 text-xs text-[#546266] tabular-nums">
            Avg sleep: {avgSleep7} hrs/night
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Check-In Consistency</span>
            <Flame className="h-4 w-4 text-[#9A5B13]" aria-hidden="true" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
              {streak}
            </span>
            <span className="text-xs text-[#546266]">day streak</span>
          </div>
          <p className="mt-1.5 text-xs text-[#546266] tabular-nums">
            {moodLogs.length} total mood entries saved
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Latest Clinical Screener</span>
            <ClipboardCheck className="h-4 w-4 text-[#4B6B8A]" aria-hidden="true" />
          </div>
          {latestAssessment ? (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
                  {latestAssessment.score}
                  <span className="text-sm font-normal text-[#546266]">
                    /{latestAssessment.maxScore}
                  </span>
                </span>
                <span className="text-xs font-medium text-[#546266]">
                  {latestAssessment.type}
                </span>
              </div>
              <div className="mt-1.5">
                <TriageIndicator
                  level={latestAssessment.triageLevel}
                  customLabel={latestAssessment.severityLabel}
                />
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-[#546266]">No assessment completed yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Upcoming Counseling</span>
            <CalendarCheck className="h-4 w-4 text-[#7A6F9B]" aria-hidden="true" />
          </div>
          {nextAppointment ? (
            <>
              <p className="mt-3 text-base font-semibold text-[#1E292B] truncate">
                {formatShortDate(nextAppointment.date)} · {nextAppointment.time}
              </p>
              <p className="mt-1 text-xs text-[#546266] truncate">
                {nextAppointment.counselorName} ·{' '}
                <span className="font-mono">{nextAppointment.referenceId}</span>
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-base font-semibold text-[#1E292B]">None scheduled</p>
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="mt-1 text-xs font-semibold text-[#3D6B59] hover:underline"
              >
                Browse verified counselors →
              </button>
            </>
          )}
        </div>
      </section>

      {/* 5-Step Guided Support Pathway */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-5 border-b border-[#E4E2DC]">
          <div>
            <h2 className="text-lg font-semibold text-[#1E292B]">
              Your 5-Step Support Pathway
            </h2>
            <p className="mt-1 text-sm text-[#546266]">
              Assess → Understand → Support → Connect → Track — structured around evidence-based campus care.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step) => (
            <div
              key={step.stepNumber}
              className="flex flex-col justify-between rounded-lg bg-[#F8F7F4] p-4 border border-[#EAE8E2]"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#546266]">
                  <span className="font-mono font-semibold text-[#3D6B59]">
                    {step.stepNumber}
                  </span>
                  <span className="tabular-nums">{step.statusText}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-[#1E292B]">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-[#546266] leading-relaxed">
                  {step.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(step.tab)}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#3D6B59] hover:text-[#2F5446] transition-colors whitespace-nowrap shrink-0"
              >
                {step.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Two-Column Action Focus: Next Session + Quick Self-Care & Privacy Status */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1E292B]">
                Confidential Counseling Summary
              </h2>
              <HeartHandshake className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />
            </div>

            {nextAppointment ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EFECE6]">
                  <div>
                    <p className="text-sm font-semibold text-[#1E292B]">
                      {nextAppointment.counselorName}
                    </p>
                    <p className="text-xs text-[#546266] mt-0.5">
                      {formatFullDate(nextAppointment.date)} · {nextAppointment.time} ·{' '}
                      {nextAppointment.mode}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#3D6B59]">
                    {nextAppointment.referenceId}
                  </span>
                </div>
                <p className="text-xs text-[#546266] leading-relaxed">
                  <span className="font-medium text-[#1E292B]">Pre-Session Consent: </span>
                  {profile.privacy.shareAssessments || profile.privacy.shareMoodTrends
                    ? 'Your counselor can preview your consented assessment scores and 14-day mood summary before you meet.'
                    : 'Clinical data sharing is currently turned off. Your counselor will only see your booking reference ID.'}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#546266]">
                You do not have an upcoming session scheduled. Verified campus psychologists offer both in-person Wellness Center slots and private virtual tele-counseling.
              </p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFECE6] flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="rounded-lg bg-[#EFF3EF] px-4 py-2 text-xs font-semibold text-[#2F5446] hover:bg-[#E2EBE3] transition-colors whitespace-nowrap shrink-0"
            >
              {nextAppointment ? 'Manage Appointment' : 'Schedule Appointment'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="text-xs font-medium text-[#546266] hover:text-[#1E292B] transition-colors whitespace-nowrap shrink-0"
            >
              Review Consent Controls
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1E292B]">
                Immediate Self-Guided Grounding Tools
              </h2>
              <Sparkles className="h-4 w-4 text-[#7A6F9B]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm text-[#546266] leading-relaxed">
              Between classes or before exams, use structured somatic regulation tools—no account sharing required.
            </p>
            <div className="mt-4 divide-y divide-[#EFECE6]">
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#1E292B]">
                    4-7-8 Guided Breathing Timer
                  </p>
                  <p className="text-xs text-[#546266]">
                    Exam Anxiety · 3 min interactive cadence
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('wellness')}
                  className="text-xs font-semibold text-[#3D6B59] hover:text-[#2F5446] whitespace-nowrap shrink-0"
                >
                  Open Tool →
                </button>
              </div>
              <div className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#1E292B]">
                    5-4-3-2-1 Sensory Grounding Walkthrough
                  </p>
                  <p className="text-xs text-[#546266]">
                    Grounding · 4 min step-by-step anchor
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('wellness')}
                  className="text-xs font-semibold text-[#3D6B59] hover:text-[#2F5446] whitespace-nowrap shrink-0"
                >
                  Open Tool →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-4 border-t border-[#EFECE6] flex items-center justify-between">
            <span className="text-xs text-[#546266]">
              All self-help records stay private on this device unless explicitly shared.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
