import { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Search,
  Wind,
  Wrench,
  X,
} from 'lucide-react';
import { WELLNESS_RESOURCES } from '../../data/seedData';
import { ResourceFormat, ResourceStressor, WellnessResource } from '../../types';

const FORMAT_FILTERS: ('All' | ResourceFormat)[] = [
  'All',
  'Articles',
  'Guided Exercises',
  'Audio',
  'Productivity Tools',
];

const STRESSOR_FILTERS: ('All' | ResourceStressor)[] = [
  'All',
  'Exam Anxiety',
  'Burnout',
  'Sleep Hygiene',
  'Grounding',
];

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const BREATH_PHASES: {
  phase: BreathPhase;
  label: string;
  instruction: string;
  seconds: number;
}[] = [
  {
    phase: 'inhale',
    label: 'Inhale Quietly',
    instruction: 'Breathe in gently through your nose',
    seconds: 4,
  },
  {
    phase: 'hold',
    label: 'Hold Gently',
    instruction: 'Rest your shoulders and hold softly',
    seconds: 7,
  },
  {
    phase: 'exhale',
    label: 'Exhale Slowly',
    instruction: 'Release steadily through pursed lips',
    seconds: 8,
  },
];

function Breathing478Widget() {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BREATH_PHASES[0].seconds);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIndex((currIdx) => {
          const nextIdx = (currIdx + 1) % BREATH_PHASES.length;
          if (nextIdx === 0) {
            setCompletedCycles((c) => c + 1);
          }
          setSecondsLeft(BREATH_PHASES[nextIdx].seconds);
          return nextIdx;
        });
        return prev;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const activePhase = BREATH_PHASES[phaseIndex];

  const handleReset = () => {
    setIsRunning(false);
    setPhaseIndex(0);
    setSecondsLeft(BREATH_PHASES[0].seconds);
    setCompletedCycles(0);
  };

  const circleScale =
    !isRunning
      ? 'scale-100'
      : activePhase.phase === 'inhale'
      ? 'scale-115'
      : activePhase.phase === 'hold'
      ? 'scale-115'
      : 'scale-90';

  const circleColor =
    activePhase.phase === 'inhale'
      ? 'bg-[#DCEAE2] border-[#3D6B59]'
      : activePhase.phase === 'hold'
      ? 'bg-[#E5E2EE] border-[#7A6F9B]'
      : 'bg-[#DFE8F0] border-[#4B6B8A]';

  return (
    <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#3D6B59]">
            Interactive Somatic Tool · Exam Anxiety
          </p>
          <h2 className="mt-1 text-base font-semibold text-[#1E292B]">
            4-7-8 Guided Breathing Timer
          </h2>
          <p className="mt-1 text-xs text-[#546266]">
            4s inhale · 7s gentle hold · 8s slow exhale. Complete 4 cycles to down-regulate acute tension.
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-[#546266] tabular-nums whitespace-nowrap shrink-0">
          Cycles: {completedCycles}/4
        </span>
      </div>

      <div className="my-6 flex flex-col items-center justify-center py-4">
        <div
          className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 transition-transform duration-1000 ease-in-out ${circleScale} ${circleColor}`}
        >
          <span className="text-xs font-semibold text-[#1E292B]">
            {isRunning ? activePhase.label : 'Ready'}
          </span>
          <span className="mt-1 font-mono text-3xl font-semibold text-[#1E292B] tabular-nums">
            {secondsLeft}s
          </span>
        </div>
        <p className="mt-4 text-xs text-[#546266] text-center min-h-[18px]">
          {isRunning
            ? activePhase.instruction
            : 'Sit comfortably with both feet grounded and press Start.'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EFECE6]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6B59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0"
          >
            {isRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                {completedCycles > 0 ? 'Resume' : 'Start Breathing'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs font-medium text-[#546266] hover:text-[#1E292B] hover:bg-[#F8F7F4] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#546266] tabular-nums">
          <span className={phaseIndex === 0 && isRunning ? 'font-semibold text-[#3D6B59]' : ''}>
            4s
          </span>
          <span>/</span>
          <span className={phaseIndex === 1 && isRunning ? 'font-semibold text-[#7A6F9B]' : ''}>
            7s
          </span>
          <span>/</span>
          <span className={phaseIndex === 2 && isRunning ? 'font-semibold text-[#4B6B8A]' : ''}>
            8s
          </span>
        </div>
      </div>
    </div>
  );
}

const GROUNDING_STEPS = [
  {
    count: 5,
    sense: 'Things You Can See',
    prompt:
      'Look slowly around the room and name five distinct details—a light reflection, a book spine, a leaf outside the window.',
    placeholder: 'e.g., desk lamp, green notebook, window latch...',
  },
  {
    count: 4,
    sense: 'Things You Can Physically Feel',
    prompt:
      'Notice four tactile sensations—your feet inside shoes, fabric on your shoulders, the cool edge of your desk.',
    placeholder: 'e.g., chair armrest, floor under heels, breeze...',
  },
  {
    count: 3,
    sense: 'Things You Can Hear',
    prompt:
      'Listen past your thoughts for three ambient sounds—a ceiling fan, distant corridor steps, birds outside.',
    placeholder: 'e.g., fan hum, distant traffic, clock...',
  },
  {
    count: 2,
    sense: 'Things You Can Smell',
    prompt:
      'Notice two subtle scents around you—fresh air, tea or coffee, soap, paper, or clean cotton.',
    placeholder: 'e.g., rain outside, warm tea...',
  },
  {
    count: 1,
    sense: 'Thing You Can Taste (or One Slow Breath)',
    prompt:
      'Notice one lingering taste, take a sip of water, or notice the cool sensation of one steady exhale.',
    placeholder: 'e.g., cool water, mint...',
  },
];

function Grounding54321Widget() {
  const [stepIdx, setStepIdx] = useState(0);
  const [notes, setNotes] = useState<string[]>(['', '', '', '', '']);
  const [completed, setCompleted] = useState(false);

  const current = GROUNDING_STEPS[stepIdx];

  const handleNoteChange = (val: string) => {
    const next = [...notes];
    next[stepIdx] = val;
    setNotes(next);
  };

  const handleNext = () => {
    if (stepIdx < GROUNDING_STEPS.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setStepIdx(0);
    setNotes(['', '', '', '', '']);
    setCompleted(false);
  };

  return (
    <div className="rounded-xl border border-[#E4E2DC] bg-white p-6 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#7A6F9B]">
            Interactive Sensory Anchor · Grounding
          </p>
          <h2 className="mt-1 text-base font-semibold text-[#1E292B]">
            5-4-3-2-1 Grounding Walkthrough
          </h2>
          <p className="mt-1 text-xs text-[#546266]">
            Shift attention gently out of anxious spirals into immediate sensory reality.
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-[#546266] tabular-nums whitespace-nowrap shrink-0">
          {completed ? 'Complete' : `Step ${stepIdx + 1}/5`}
        </span>
      </div>

      {completed ? (
        <div className="my-6 rounded-lg bg-[#F3F8F5] border border-[#C9DED3] p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2E6B52]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Grounding Cycle Complete
          </div>
          <p className="text-xs text-[#2F4741] leading-relaxed">
            Take one slow breath and notice if your shoulders or jaw feel even slightly looser. You can repeat this walkthrough whenever academic stress peaks.
          </p>
        </div>
      ) : (
        <div className="my-5 space-y-4">
          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            {GROUNDING_STEPS.map((s, idx) => (
              <button
                key={s.count}
                type="button"
                onClick={() => setStepIdx(idx)}
                className={`flex-1 rounded-md py-1.5 text-center font-mono text-xs font-semibold transition-colors ${
                  idx === stepIdx
                    ? 'bg-[#7A6F9B] text-white'
                    : idx < stepIdx
                    ? 'bg-[#EAE6F3] text-[#5B5277]'
                    : 'bg-[#F3F2EE] text-[#546266]'
                }`}
              >
                {s.count}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-[#F8F7F4] border border-[#EAE8E2] p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#1E292B]">
              {current.count} — {current.sense}
            </h3>
            <p className="text-xs text-[#546266] leading-relaxed">
              {current.prompt}
            </p>
            <input
              type="text"
              value={notes[stepIdx]}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder={current.placeholder}
              className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#7A6F9B] focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EFECE6]">
        {completed ? (
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7A6F9B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#665C85] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Practice Again
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={stepIdx === 0}
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              className="rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs font-medium text-[#546266] hover:text-[#1E292B] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-[#7A6F9B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#665C85] transition-colors whitespace-nowrap shrink-0"
            >
              {stepIdx === GROUNDING_STEPS.length - 1
                ? 'Complete Walkthrough'
                : `Next (${GROUNDING_STEPS[stepIdx + 1].count} Sense)`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function WellnessHubSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'All' | ResourceFormat>('All');
  const [stressorFilter, setStressorFilter] = useState<'All' | ResourceStressor>('All');
  const [openResource, setOpenResource] = useState<WellnessResource | null>(null);

  const filteredResources = WELLNESS_RESOURCES.filter((res) => {
    const matchesFormat = formatFilter === 'All' || res.format === formatFilter;
    const matchesStressor = stressorFilter === 'All' || res.stressor === stressorFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      res.title.toLowerCase().includes(q) ||
      res.summary.toLowerCase().includes(q) ||
      res.stressor.toLowerCase().includes(q) ||
      res.format.toLowerCase().includes(q);
    return matchesFormat && matchesStressor && matchesSearch;
  });

  const formatIcon = (format: ResourceFormat) => {
    switch (format) {
      case 'Articles':
        return <BookOpen className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />;
      case 'Guided Exercises':
        return <Wind className="h-4 w-4 text-[#7A6F9B]" aria-hidden="true" />;
      case 'Audio':
        return <Headphones className="h-4 w-4 text-[#4B6B8A]" aria-hidden="true" />;
      case 'Productivity Tools':
        return <Wrench className="h-4 w-4 text-[#9A5B13]" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Built-In Interactive Self-Guided Tools */}
      <section>
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-[#1E292B]">
            Curated Mental Wellness Resource Hub
          </h1>
          <p className="mt-1 text-sm text-[#546266]">
            Immediate evidence-based regulation exercises and university-tailored mental wellness guides curated by our campus clinical team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <Breathing478Widget />
          <Grounding54321Widget />
        </div>
      </section>

      {/* Search & Filterable Resource Library */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#EFECE6]">
          <div>
            <h2 className="text-base font-semibold text-[#1E292B]">
              Campus Self-Help Library
            </h2>
            <p className="text-xs text-[#546266] mt-0.5">
              Filter by format or academic stressor to find concise, actionable strategies.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A9497]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exam anxiety, sleep, burnout..."
              className="w-full rounded-lg border border-[#D4D9D5] bg-[#F8F7F4] pl-9 pr-3 py-2 text-xs text-[#1E292B] placeholder:text-[#8A9497] focus:bg-white focus:border-[#3D6B59] focus:outline-none"
            />
          </div>
        </div>

        {/* Interactive Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F3F2EE]">
            {FORMAT_FILTERS.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setFormatFilter(fmt)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  formatFilter === fmt
                    ? 'bg-white text-[#1E292B] shadow-xs'
                    : 'text-[#546266] hover:text-[#1E292B]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STRESSOR_FILTERS.map((stressor) => (
              <button
                key={stressor}
                type="button"
                onClick={() => setStressorFilter(stressor)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  stressorFilter === stressor
                    ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#2F5446]'
                    : 'border-[#E4E2DC] bg-white text-[#546266] hover:text-[#1E292B]'
                }`}
              >
                {stressor}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        {filteredResources.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Compass className="h-6 w-6 text-[#8A9497] mx-auto" aria-hidden="true" />
            <p className="text-sm text-[#546266]">
              No resources match the current filter combination.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFormatFilter('All');
                setStressorFilter('All');
              }}
              className="text-xs font-semibold text-[#3D6B59] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((res) => (
              <article
                key={res.id}
                className="rounded-lg border border-[#E4E2DC] bg-[#FAF9F6] p-5 flex flex-col justify-between gap-4 hover:border-[#C8D3CC] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#546266]">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#1E292B]">
                      {formatIcon(res.format)}
                      {res.format}
                    </span>
                    <span>
                      {res.stressor} · {res.duration}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-base font-semibold text-[#1E292B]">
                    {res.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#546266] leading-relaxed">
                    {res.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#EAE8E2]">
                  <span className="text-xs text-[#546266]">{res.author}</span>
                  {res.interactiveTool ? (
                    <span className="text-xs font-semibold text-[#3D6B59]">
                      Available above ↑
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenResource(res)}
                      className="text-xs font-semibold text-[#3D6B59] hover:text-[#2F5446] transition-colors whitespace-nowrap shrink-0"
                    >
                      Read Module →
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Resource Reader Modal */}
      {openResource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E292B]/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenResource(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl border border-[#E4E2DC] bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#E4E2DC]">
              <div>
                <p className="text-xs text-[#546266]">
                  {openResource.format} · {openResource.stressor} · {openResource.duration}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#1E292B]">
                  {openResource.title}
                </h2>
                <p className="mt-1 text-xs text-[#546266]">
                  Prepared by {openResource.author}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenResource(null)}
                aria-label="Close resource reader"
                className="rounded-lg p-2 text-[#546266] hover:bg-[#F3F2EE] hover:text-[#1E292B]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {openResource.sections?.map((sec) => (
                <div key={sec.heading} className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-[#1E292B]">
                    {sec.heading}
                  </h3>
                  <p className="text-sm text-[#546266] leading-relaxed">{sec.body}</p>
                </div>
              ))}

              {openResource.actionSteps && openResource.actionSteps.length > 0 && (
                <div className="rounded-lg bg-[#EFF3EF] p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-[#2F5446]">
                    Practical Takeaways
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#2F4741] list-disc pl-4">
                    {openResource.actionSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
