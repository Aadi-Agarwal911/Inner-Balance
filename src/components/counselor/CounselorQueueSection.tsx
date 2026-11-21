import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  AppState,
  Appointment,
  CounselorSessionNote,
  InfluencingFactor,
} from '../../types';
import { formatFullDate, getTodayDateStr } from '../../utils/storage';
import { TriageIndicator } from '../TriageBadge';

interface CounselorQueueSectionProps {
  state: AppState;
  onAddSessionNote: (note: CounselorSessionNote) => void;
  onMarkCompleted: (appointmentId: string) => void;
}

type QueueFilter = 'all' | 'urgent' | 'upcoming' | 'completed';

interface ResolvedPreSession {
  consentedAssessments: boolean;
  consentedMoodTrends: boolean;
  consentedTriggers: boolean;
  assessmentsSummary: { type: string; score: number; maxScore: number; severity: string; date: string }[];
  avgMood14d?: number;
  avgSleep14d?: number;
  topTriggers: InfluencingFactor[];
}

export function CounselorQueueSection({
  state,
  onAddSessionNote,
  onMarkCompleted,
}: CounselorQueueSectionProps) {
  const [filter, setFilter] = useState<QueueFilter>('all');

  const activeAppointments = useMemo(() => {
    const priorityRank = { high: 0, moderate: 1, low: 2 };
    return [...state.appointments]
      .filter((a) => a.status !== 'Cancelled')
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'Upcoming' ? -1 : 1;
        }
        if (priorityRank[a.triagePriority] !== priorityRank[b.triagePriority]) {
          return priorityRank[a.triagePriority] - priorityRank[b.triagePriority];
        }
        return a.date.localeCompare(b.date);
      });
  }, [state.appointments]);

  const filteredQueue = useMemo(() => {
    return activeAppointments.filter((a) => {
      if (filter === 'urgent') return a.triagePriority === 'high' && a.status === 'Upcoming';
      if (filter === 'upcoming') return a.status === 'Upcoming';
      if (filter === 'completed') return a.status === 'Completed';
      return true;
    });
  }, [activeAppointments, filter]);

  const [selectedId, setSelectedId] = useState<string>(
    activeAppointments[0]?.id ?? ''
  );

  const selectedAppointment: Appointment | undefined =
    filteredQueue.find((a) => a.id === selectedId) ?? filteredQueue[0];

  // Session note form state
  const [presentingTheme, setPresentingTheme] = useState('');
  const [observations, setObservations] = useState('');
  const [followUpPlan, setFollowUpPlan] = useState('');
  const [riskStatus, setRiskStatus] = useState<'Routine' | 'Monitor Closely' | 'Escalated'>('Routine');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const resolvePreSessionSummary = (apt: Appointment): ResolvedPreSession => {
    if (apt.isCurrentStudent) {
      const { privacy } = state.profile;
      const latestByType = (['PHQ-9', 'GAD-7', 'PSS-10'] as const)
        .map((type) =>
          [...state.assessments]
            .filter((a) => a.type === type)
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]
        )
        .filter(Boolean)
        .map((a) => ({
          type: a.type,
          score: a.score,
          maxScore: a.maxScore,
          severity: a.severityLabel,
          date: a.date,
        }));

      const last14 = [...state.moodLogs]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 14);
      const avgMood14d =
        last14.length > 0
          ? Number(
              (last14.reduce((s, l) => s + l.moodScore, 0) / last14.length).toFixed(1)
            )
          : undefined;
      const avgSleep14d =
        last14.length > 0
          ? Number(
              (last14.reduce((s, l) => s + l.sleepHours, 0) / last14.length).toFixed(1)
            )
          : undefined;

      const factorCounts: Record<string, number> = {};
      last14.forEach((l) =>
        l.factors.forEach((f) => {
          factorCounts[f] = (factorCounts[f] ?? 0) + 1;
        })
      );
      const topTriggers = Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([f]) => f as InfluencingFactor);

      return {
        consentedAssessments: privacy.shareAssessments,
        consentedMoodTrends: privacy.shareMoodTrends,
        consentedTriggers: privacy.shareTriggers,
        assessmentsSummary: latestByType,
        avgMood14d,
        avgSleep14d,
        topTriggers,
      };
    }

    const snap = apt.peerSnapshot;
    if (!snap) {
      return {
        consentedAssessments: false,
        consentedMoodTrends: false,
        consentedTriggers: false,
        assessmentsSummary: [],
        topTriggers: [],
      };
    }

    const list: ResolvedPreSession['assessmentsSummary'] = [];
    if (snap.latestPhq9) {
      list.push({
        type: 'PHQ-9',
        score: snap.latestPhq9.score,
        maxScore: 27,
        severity: snap.latestPhq9.severity,
        date: snap.latestPhq9.date,
      });
    }
    if (snap.latestGad7) {
      list.push({
        type: 'GAD-7',
        score: snap.latestGad7.score,
        maxScore: 21,
        severity: snap.latestGad7.severity,
        date: snap.latestGad7.date,
      });
    }
    if (snap.latestPss10) {
      list.push({
        type: 'PSS-10',
        score: snap.latestPss10.score,
        maxScore: 40,
        severity: snap.latestPss10.severity,
        date: snap.latestPss10.date,
      });
    }

    return {
      consentedAssessments: snap.consentedAssessments,
      consentedMoodTrends: snap.consentedMoodTrends,
      consentedTriggers: snap.consentedTriggers,
      assessmentsSummary: list,
      avgMood14d: snap.avgMood14d,
      avgSleep14d: snap.avgSleep14d,
      topTriggers: snap.topTriggers ?? [],
    };
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !observations.trim()) return;

    const newNote: CounselorSessionNote = {
      id: `note-${Date.now()}`,
      referenceId: selectedAppointment.referenceId,
      studentAlias: selectedAppointment.studentAlias,
      counselorName: selectedAppointment.counselorName,
      date: getTodayDateStr(),
      presentingTheme: presentingTheme.trim() || 'General Student Wellness Consultation',
      observations: observations.trim(),
      followUpPlan: followUpPlan.trim() || 'Continue self-monitoring and follow up as needed.',
      riskStatus,
    };

    onAddSessionNote(newNote);
    setPresentingTheme('');
    setObservations('');
    setFollowUpPlan('');
    setRiskStatus('Routine');
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2600);
  };

  const urgentCount = activeAppointments.filter(
    (a) => a.triagePriority === 'high' && a.status === 'Upcoming'
  ).length;
  const upcomingCount = activeAppointments.filter((a) => a.status === 'Upcoming').length;

  const selectedNotes = selectedAppointment
    ? state.sessionNotes.filter((n) => n.referenceId === selectedAppointment.referenceId)
    : [];

  const preSession = selectedAppointment
    ? resolvePreSessionSummary(selectedAppointment)
    : null;

  return (
    <div className="space-y-6">
      {/* Top KPI Bar for Counselor Operations */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Urgent / Flagged Queue</span>
            <ShieldAlert className="h-4 w-4 text-[#B42318]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#B42318] tabular-nums">
            {urgentCount}
          </p>
          <p className="mt-1 text-xs text-[#546266]">
            Priority human triage slots awaiting session
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Upcoming Sessions</span>
            <ClipboardCheck className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {upcomingCount}
          </p>
          <p className="mt-1 text-xs text-[#546266]">
            Scheduled across campus psychologists
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Confidential Session Notes</span>
            <FileText className="h-4 w-4 text-[#4B6B8A]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {state.sessionNotes.length}
          </p>
          <p className="mt-1 text-xs text-[#546266]">
            Linked strictly to pseudonymized booking tokens
          </p>
        </div>
      </section>

      {/* Main Master-Detail Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Appointment & Triage Queue */}
        <section className="xl:col-span-5 rounded-xl border border-[#E4E2DC] bg-white overflow-hidden">
          <div className="p-5 border-b border-[#E4E2DC] space-y-3">
            <div>
              <h1 className="text-base font-semibold text-[#1E292B]">
                Appointment &amp; Triage Queue
              </h1>
              <p className="text-xs text-[#546266] mt-0.5">
                All student identities remain pseudonymized until in-session disclosure.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F3F2EE]">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'urgent', label: `Urgent (${urgentCount})` },
                  { id: 'upcoming', label: 'Upcoming' },
                  { id: 'completed', label: 'Completed' },
                ] as { id: QueueFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    filter === tab.id
                      ? 'bg-white text-[#1E292B] shadow-xs'
                      : 'text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#546266]">
              No appointments match this filter.
            </div>
          ) : (
            <div className="divide-y divide-[#EFECE6]">
              {filteredQueue.map((apt) => {
                const isSelected = selectedAppointment?.id === apt.id;
                return (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => setSelectedId(apt.id)}
                    className={`w-full text-left px-5 py-4 transition-colors ${
                      isSelected ? 'bg-[#EFF3EF]' : 'bg-white hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[#3D6B59]">
                        {apt.referenceId} · {apt.studentAlias}
                      </span>
                      <TriageIndicator
                        level={apt.triagePriority}
                        customLabel={
                          apt.triagePriority === 'high'
                            ? 'Urgent / Flagged'
                            : apt.triagePriority === 'moderate'
                            ? 'Moderate'
                            : 'Routine'
                        }
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-[#1E292B]">
                      {apt.counselorName} · {apt.mode}
                    </p>
                    <p className="mt-0.5 text-xs text-[#546266] tabular-nums">
                      {formatFullDate(apt.date)} at {apt.time} · {apt.status}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Pre-Session Clinical Summary & Confidential Notes */}
        <section className="xl:col-span-7 space-y-6">
          {selectedAppointment && preSession ? (
            <>
              {/* Pre-Session Clinical Summary Panel */}
              <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#EFECE6]">
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-[#546266]">
                      <span className="font-mono font-semibold text-[#3D6B59]">
                        {selectedAppointment.referenceId}
                      </span>
                      <span>·</span>
                      <span className="font-mono font-medium text-[#1E292B]">
                        {selectedAppointment.studentAlias}
                      </span>
                      <span>·</span>
                      <span>{selectedAppointment.status}</span>
                    </div>
                    <h2 className="mt-1 text-lg font-semibold text-[#1E292B]">
                      Pre-Session Clinical Summary
                    </h2>
                    <p className="mt-0.5 text-xs text-[#546266] tabular-nums">
                      Assigned: {selectedAppointment.counselorName} ·{' '}
                      {formatFullDate(selectedAppointment.date)} at{' '}
                      {selectedAppointment.time}
                    </p>
                  </div>

                  {selectedAppointment.status === 'Upcoming' && (
                    <button
                      type="button"
                      onClick={() => onMarkCompleted(selectedAppointment.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#3D6B59] bg-white px-3.5 py-2 text-xs font-semibold text-[#3D6B59] hover:bg-[#EFF3EF] transition-colors whitespace-nowrap shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Mark Session Completed
                    </button>
                  )}
                </div>

                {selectedAppointment.concernNote && (
                  <div className="rounded-lg bg-[#F8F7F4] border border-[#EAE8E2] px-4 py-3">
                    <p className="text-[11px] font-medium text-[#546266]">
                      Student Booking Note
                    </p>
                    <p className="mt-1 text-xs text-[#1E292B] leading-relaxed">
                      {selectedAppointment.concernNote}
                    </p>
                  </div>
                )}

                {/* Consent-Gated Data Display */}
                {!preSession.consentedAssessments &&
                !preSession.consentedMoodTrends &&
                !preSession.consentedTriggers ? (
                  <div className="rounded-lg border border-[#E4E2DC] bg-[#F8F7F4] p-6 flex items-start gap-3">
                    <Lock
                      className="h-5 w-5 text-[#546266] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-[#1E292B]">
                        Protected by Student Privacy Settings
                      </h3>
                      <p className="mt-1 text-xs text-[#546266] leading-relaxed">
                        {selectedAppointment.studentAlias} has disabled pre-session clinical data sharing. Assessment scores, 14-day mood trends, and trigger tags are restricted until shared voluntarily during the session.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#2E6B52]">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Student Consent Verified — Displaying Permitted Pre-Session Metrics Only
                    </div>

                    {/* Assessments Block */}
                    <div className="rounded-lg border border-[#E4E2DC] p-4">
                      <p className="text-xs font-semibold text-[#1E292B] mb-2.5">
                        Standardized Screening Scores
                      </p>
                      {!preSession.consentedAssessments ? (
                        <p className="text-xs text-[#546266] inline-flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          Protected by Student Privacy Settings
                        </p>
                      ) : preSession.assessmentsSummary.length === 0 ? (
                        <p className="text-xs text-[#546266]">
                          No recent screeners recorded.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {preSession.assessmentsSummary.map((item) => (
                            <div
                              key={item.type}
                              className="rounded-lg bg-[#F8F7F4] p-3 border border-[#EAE8E2]"
                            >
                              <p className="font-mono text-xs font-semibold text-[#546266]">
                                {item.type}
                              </p>
                              <p className="mt-1 font-mono text-lg font-semibold text-[#1E292B] tabular-nums">
                                {item.score}
                                <span className="text-xs font-normal text-[#546266]">
                                  /{item.maxScore}
                                </span>
                              </p>
                              <p className="mt-0.5 text-xs text-[#546266]">
                                {item.severity}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 14-Day Mood & Triggers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-lg border border-[#E4E2DC] p-4">
                        <p className="text-xs font-semibold text-[#1E292B] mb-2">
                          14-Day Mood &amp; Sleep Summary
                        </p>
                        {!preSession.consentedMoodTrends ? (
                          <p className="text-xs text-[#546266] inline-flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            Protected by Student Privacy Settings
                          </p>
                        ) : (
                          <div className="space-y-1 text-xs text-[#546266] tabular-nums">
                            <p>
                              Average Mood Valence:{' '}
                              <span className="font-mono font-semibold text-[#1E292B]">
                                {preSession.avgMood14d ?? '—'} / 10
                              </span>
                            </p>
                            <p>
                              Average Sleep Duration:{' '}
                              <span className="font-mono font-semibold text-[#1E292B]">
                                {preSession.avgSleep14d ?? '—'} hrs/night
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-[#E4E2DC] p-4">
                        <p className="text-xs font-semibold text-[#1E292B] mb-2">
                          Top Reported Stress Triggers
                        </p>
                        {!preSession.consentedTriggers ? (
                          <p className="text-xs text-[#546266] inline-flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                            Protected by Student Privacy Settings
                          </p>
                        ) : preSession.topTriggers.length > 0 ? (
                          <p className="text-xs text-[#1E292B]">
                            {preSession.topTriggers.join(' · ')}
                          </p>
                        ) : (
                          <p className="text-xs text-[#546266]">None logged.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confidential Session Notes Form */}
              <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 space-y-5">
                <div className="pb-4 border-b border-[#EFECE6]">
                  <h2 className="text-base font-semibold text-[#1E292B]">
                    Confidential Session Notes
                  </h2>
                  <p className="mt-0.5 text-xs text-[#546266]">
                    Structured clinical observations linked exclusively to booking token{' '}
                    <span className="font-mono font-semibold text-[#1E292B]">
                      {selectedAppointment.referenceId}
                    </span>{' '}
                    ({selectedAppointment.studentAlias}).
                  </p>
                </div>

                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="note-theme"
                        className="block text-xs font-medium text-[#1E292B] mb-1.5"
                      >
                        Presenting Theme
                      </label>
                      <input
                        id="note-theme"
                        type="text"
                        value={presentingTheme}
                        onChange={(e) => setPresentingTheme(e.target.value)}
                        placeholder="e.g., Midterm anxiety & sleep debt"
                        className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="note-risk"
                        className="block text-xs font-medium text-[#1E292B] mb-1.5"
                      >
                        Clinical Follow-Up Status
                      </label>
                      <select
                        id="note-risk"
                        value={riskStatus}
                        onChange={(e) =>
                          setRiskStatus(
                            e.target.value as 'Routine' | 'Monitor Closely' | 'Escalated'
                          )
                        }
                        className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs text-[#1E292B] focus:border-[#3D6B59] focus:outline-none"
                      >
                        <option value="Routine">Routine</option>
                        <option value="Monitor Closely">Monitor Closely</option>
                        <option value="Escalated">Escalated — Priority Care</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="note-observations"
                      className="block text-xs font-medium text-[#1E292B] mb-1.5"
                    >
                      Structured Session Observations
                    </label>
                    <textarea
                      id="note-observations"
                      required
                      rows={3}
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Summarize affect, coping strategies discussed, and protective factors without recording personally identifying details..."
                      className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="note-followup"
                      className="block text-xs font-medium text-[#1E292B] mb-1.5"
                    >
                      Follow-Up Recommendations
                    </label>
                    <textarea
                      id="note-followup"
                      rows={2}
                      value={followUpPlan}
                      onChange={(e) => setFollowUpPlan(e.target.value)}
                      placeholder="e.g., Practice 4-7-8 breathing before viva; schedule 2-week check-in..."
                      className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      className="rounded-lg bg-[#3D6B59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0"
                    >
                      Log Confidential Session Note
                    </button>
                    {noteSavedFeedback && (
                      <span className="text-xs font-semibold text-[#2E6B52]">
                        Note saved under {selectedAppointment.referenceId}
                      </span>
                    )}
                  </div>
                </form>

                {/* Logged Notes for this Token */}
                {selectedNotes.length > 0 && (
                  <div className="pt-4 border-t border-[#EFECE6] space-y-3">
                    <h3 className="text-xs font-semibold text-[#1E292B]">
                      Recorded Notes for {selectedAppointment.referenceId}
                    </h3>
                    {selectedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-[#EAE8E2] bg-[#FAF9F6] p-4 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-[#1E292B]">
                            {note.presentingTheme}
                          </span>
                          <span className="text-[#546266] tabular-nums">
                            {formatFullDate(note.date)} · {note.riskStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[#1E292B] leading-relaxed">
                          {note.observations}
                        </p>
                        <p className="text-xs text-[#546266]">
                          <span className="font-medium text-[#1E292B]">Follow-up: </span>
                          {note.followUpPlan}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#E4E2DC] bg-white p-8 text-center text-sm text-[#546266]">
              Select a session from the queue to inspect its consent-gated clinical summary.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
