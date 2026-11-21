import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  PhoneCall,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ASSESSMENT_DEFINITIONS,
  evaluateAssessment,
  TriageEvaluation,
} from '../../data/assessments';
import { AssessmentRecord, AssessmentType, StudentTab } from '../../types';
import { formatFullDate, getTodayDateStr } from '../../utils/storage';
import { TriageIndicator } from '../TriageBadge';

interface AssessmentsSectionProps {
  assessments: AssessmentRecord[];
  onSaveAssessment: (record: AssessmentRecord) => void;
  onNavigate: (tab: StudentTab) => void;
  onPriorityBook: () => void;
  onOpenCrisis: () => void;
}

const ASSESSMENT_ORDER: AssessmentType[] = ['PHQ-9', 'GAD-7', 'PSS-10'];

export function AssessmentsSection({
  assessments,
  onSaveAssessment,
  onNavigate,
  onPriorityBook,
  onOpenCrisis,
}: AssessmentsSectionProps) {
  const [activeType, setActiveType] = useState<AssessmentType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<(number | null)[]>([]);
  const [latestResult, setLatestResult] = useState<{
    type: AssessmentType;
    evaluation: TriageEvaluation;
  } | null>(null);

  const startAssessment = (type: AssessmentType) => {
    const def = ASSESSMENT_DEFINITIONS[type];
    setActiveType(type);
    setCurrentStep(0);
    setResponses(Array(def.questions.length).fill(null));
    setLatestResult(null);
  };

  const handleSelectOption = (value: number) => {
    if (!activeType) return;
    const def = ASSESSMENT_DEFINITIONS[activeType];
    const next = [...responses];
    next[currentStep] = value;
    setResponses(next);

    if (currentStep < def.questions.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, def.questions.length - 1));
      }, 140);
    }
  };

  const handleSubmit = () => {
    if (!activeType) return;
    if (responses.some((r) => r === null)) return;
    const numericResponses = responses as number[];
    const evaluation = evaluateAssessment(activeType, numericResponses);

    const record: AssessmentRecord = {
      id: `asm-${Date.now()}`,
      type: activeType,
      date: getTodayDateStr(),
      timestamp: new Date().toISOString(),
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      severityLabel: evaluation.severityLabel,
      triageLevel: evaluation.triageLevel,
      itemResponses: numericResponses,
      flaggedSelfHarmItem: evaluation.flaggedSelfHarmItem,
    };

    onSaveAssessment(record);
    setLatestResult({ type: activeType, evaluation });
    setActiveType(null);
  };

  const getLatestByType = (type: AssessmentType) =>
    [...assessments]
      .filter((a) => a.type === type)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  const sortedHistory = [...assessments].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );

  // Active Step-by-Step Questionnaire View
  if (activeType) {
    const def = ASSESSMENT_DEFINITIONS[activeType];
    const totalQuestions = def.questions.length;
    const currentAnswer = responses[currentStep];
    const allAnswered = responses.every((r) => r !== null);
    const progressPct = Math.round(((currentStep + 1) / totalQuestions) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveType(null)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#546266] hover:text-[#1E292B] transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Assessments
          </button>
          <span className="font-mono text-xs text-[#546266] tabular-nums">
            Question {currentStep + 1} of {totalQuestions} · {progressPct}%
          </span>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#EFECE6]">
            <div>
              <p className="text-xs font-medium text-[#3D6B59]">{def.type}</p>
              <h1 className="text-lg font-semibold text-[#1E292B]">{def.fullName}</h1>
            </div>
            <span className="text-xs text-[#546266] tabular-nums">
              0–{def.maxScore} standardized scale
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#EFF3EF]">
            <div
              className="h-full rounded-full bg-[#3D6B59] transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="mt-6 text-xs font-medium text-[#546266]">
            {def.timeframePrompt}
          </p>

          <h2 className="mt-2 text-lg md:text-xl font-semibold text-[#1E292B] leading-snug">
            {currentStep + 1}. {def.questions[currentStep]}
          </h2>

          {activeType === 'PHQ-9' && currentStep === 8 && (
            <div className="mt-3 rounded-lg bg-[#FEF6F5] border border-[#F3C5C1] px-4 py-2.5 text-xs text-[#7A271A]">
              If you are currently having thoughts of hurting yourself, immediate 24/7 support is available via the Crisis Helplines button above or by calling Tele-MANAS at <span className="font-mono font-semibold">14416</span>.
            </div>
          )}

          <div className="mt-6 space-y-2.5">
            {def.options.map((opt) => {
              const selected = currentAnswer === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3.5 text-left transition-colors ${
                    selected
                      ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#1E292B]'
                      : 'border-[#E4E2DC] bg-white text-[#1E292B] hover:bg-[#F8F7F4]'
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      selected ? 'font-semibold text-[#3D6B59]' : 'text-[#546266]'
                    }`}
                  >
                    {opt.value}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-5 border-t border-[#EFECE6] flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4D9D5] bg-white px-4 py-2 text-xs font-medium text-[#1E292B] hover:bg-[#F8F7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {currentStep < totalQuestions - 1 ? (
                <button
                  type="button"
                  disabled={currentAnswer === null}
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6B59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  Next Question
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!allAnswered}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6B59] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2F5446] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                >
                  Calculate Score & Triage
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-xl font-semibold text-[#1E292B]">
              Validated Self-Assessments & Rule-Based Triage
            </h1>
            <p className="mt-1 text-sm text-[#546266] leading-relaxed">
              Complete standardized clinical screening tools to understand your current stress, anxiety, or mood load. Scoring uses fixed, deterministic clinical thresholds—not automated diagnosis—to match you with appropriate campus support.
            </p>
          </div>
          <div className="text-xs text-[#546266] shrink-0">
            <span>PHQ-9 · GAD-7 · PSS-10</span>
          </div>
        </div>
      </section>

      {/* Immediate Triage Result Panel after Submission */}
      {latestResult && (
        <section
          className={`rounded-xl border p-6 ${
            latestResult.evaluation.triageLevel === 'high'
              ? 'border-[#F3C5C1] bg-[#FEF6F5]'
              : latestResult.evaluation.triageLevel === 'moderate'
              ? 'border-[#F2D5A7] bg-[#FDF9F1]'
              : 'border-[#C9DED3] bg-[#F3F8F5]'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <TriageIndicator
                  level={latestResult.evaluation.triageLevel}
                  customLabel={latestResult.evaluation.summaryTitle}
                />
                <span className="text-xs text-[#546266]">·</span>
                <span className="font-mono text-xs font-semibold text-[#1E292B] tabular-nums">
                  {latestResult.type} Score: {latestResult.evaluation.score} /{' '}
                  {latestResult.evaluation.maxScore} ({latestResult.evaluation.severityLabel})
                </span>
              </div>

              <p className="text-sm text-[#1E292B] leading-relaxed">
                {latestResult.evaluation.guidanceText}
              </p>

              <ul className="space-y-1.5 text-xs text-[#2F4741] list-disc pl-4">
                {latestResult.evaluation.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0 min-w-[220px]">
              {latestResult.evaluation.triageLevel === 'high' && (
                <>
                  <button
                    type="button"
                    onClick={onPriorityBook}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B42318] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#912018] transition-colors whitespace-nowrap"
                  >
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    One-Click Priority Counseling
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCrisis}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#B42318]/40 bg-white px-4 py-2 text-xs font-semibold text-[#B42318] hover:bg-[#FEF0EE] transition-colors whitespace-nowrap"
                  >
                    <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                    Open 24/7 Crisis Helplines
                  </button>
                </>
              )}

              {latestResult.evaluation.triageLevel === 'moderate' && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('booking')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B59] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap"
                  >
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                    Book Campus Counselor
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('wellness')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D4D9D5] bg-white px-4 py-2 text-xs font-medium text-[#1E292B] hover:bg-[#EFF3EF] transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#7A6F9B]" aria-hidden="true" />
                    Try Mindfulness Exercises
                  </button>
                </>
              )}

              {latestResult.evaluation.triageLevel === 'low' && (
                <button
                  type="button"
                  onClick={() => onNavigate('wellness')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B59] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Explore Self-Help Library
                </button>
              )}
            </div>
          </div>

          {/* Inline Crisis Helpline Cards for High / Urgent Risk */}
          {latestResult.evaluation.triageLevel === 'high' && (
            <div className="mt-5 pt-5 border-t border-[#F3C5C1] grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-white border border-[#F3C5C1] p-3.5">
                <p className="text-xs font-semibold text-[#1E292B]">
                  Tele-MANAS (24/7 National)
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#B42318]">
                  14416 / 1-800-891-4416
                </p>
                <p className="mt-1 text-xs text-[#546266]">
                  Free, confidential 24/7 clinical support
                </p>
              </div>
              <div className="rounded-lg bg-white border border-[#F3C5C1] p-3.5">
                <p className="text-xs font-semibold text-[#1E292B]">
                  Campus 24/7 Crisis Line
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#B42318]">
                  +91 22 2576 9111
                </p>
                <p className="mt-1 text-xs text-[#546266]">
                  On-call university clinical psychologist
                </p>
              </div>
              <div className="rounded-lg bg-white border border-[#F3C5C1] p-3.5">
                <p className="text-xs font-semibold text-[#1E292B]">
                  Vandrevala Foundation
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-[#B42318]">
                  +91 9999 666 555
                </p>
                <p className="mt-1 text-xs text-[#546266]">
                  24/7 call &amp; WhatsApp crisis response
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3 Standardized Assessment Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {ASSESSMENT_ORDER.map((type) => {
          const def = ASSESSMENT_DEFINITIONS[type];
          const recent = getLatestByType(type);

          return (
            <div
              key={type}
              className="rounded-xl border border-[#E4E2DC] bg-white p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#546266]">
                  <span className="font-mono font-semibold text-[#3D6B59]">
                    {def.type}
                  </span>
                  <span className="tabular-nums">
                    {def.questions.length} items · ~{def.estimatedMinutes} min
                  </span>
                </div>
                <h2 className="mt-2 text-base font-semibold text-[#1E292B]">
                  {def.fullName}
                </h2>
                <p className="mt-1.5 text-sm text-[#546266] leading-relaxed">
                  {def.shortDescription}
                </p>

                <div className="mt-4 pt-4 border-t border-[#EFECE6] space-y-1 text-xs text-[#546266]">
                  <p className="font-medium text-[#1E292B]">Deterministic Thresholds</p>
                  <p>{def.thresholdSummary.low}</p>
                  <p>{def.thresholdSummary.moderate}</p>
                  <p>{def.thresholdSummary.high}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#EFECE6] space-y-3">
                {recent ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#546266]">
                      Last ({formatFullDate(recent.date)})
                    </span>
                    <span className="font-mono font-semibold text-[#1E292B] tabular-nums">
                      {recent.score}/{recent.maxScore}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-[#546266]">Not completed yet</p>
                )}

                <button
                  type="button"
                  onClick={() => startAssessment(type)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6B59] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap"
                >
                  {recent ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Retake {def.type}
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                      Start {def.type}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Assessment History Table */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1E292B]">
              Completed Assessment History
            </h2>
            <p className="text-xs text-[#546266] mt-0.5">
              Stored locally with deterministic severity tiering. Shared with counselors only if enabled in Privacy Settings.
            </p>
          </div>
          <span className="font-mono text-xs text-[#546266] tabular-nums">
            {sortedHistory.length} records
          </span>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#546266]">
              No completed assessments yet. Select PHQ-9, GAD-7, or PSS-10 above to begin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4E2DC] bg-[#F8F7F4] text-xs font-medium text-[#546266]">
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-4">Screener</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4">Clinical Severity</th>
                  <th className="py-3 px-6">Triage Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] text-sm">
                {sortedHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="py-3.5 px-6 text-xs text-[#546266] whitespace-nowrap tabular-nums">
                      {formatFullDate(item.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#1E292B] whitespace-nowrap">
                      {item.type}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-[#1E292B] tabular-nums whitespace-nowrap">
                      {item.score}
                      <span className="text-xs font-normal text-[#546266]">
                        /{item.maxScore}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#1E292B]">
                      {item.severityLabel}
                      {item.flaggedSelfHarmItem && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[#B42318] font-semibold">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          Item 9 Flag
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <TriageIndicator level={item.triageLevel} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
