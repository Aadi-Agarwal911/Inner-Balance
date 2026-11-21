import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Check, Flame, Lock, Moon, NotebookPen, TrendingUp } from 'lucide-react';
import { INFLUENCING_FACTORS } from '../../data/seedData';
import { InfluencingFactor, MoodLog } from '../../types';
import {
  computeMoodStreak,
  formatFullDate,
  formatShortDate,
  getTodayDateStr,
} from '../../utils/storage';

interface MoodTrackerSectionProps {
  moodLogs: MoodLog[];
  onSaveMoodLog: (log: MoodLog) => void;
}

const MOOD_LABELS: Record<number, { label: string; tone: string }> = {
  1: { label: 'Overwhelmed', tone: 'text-[#B42318]' },
  2: { label: 'Very Low', tone: 'text-[#B42318]' },
  3: { label: 'Struggling', tone: 'text-[#9A5B13]' },
  4: { label: 'Tense / Drained', tone: 'text-[#9A5B13]' },
  5: { label: 'Uneasy / Flat', tone: 'text-[#546266]' },
  6: { label: 'Steady', tone: 'text-[#4B6B8A]' },
  7: { label: 'Calm & Balanced', tone: 'text-[#2E6B52]' },
  8: { label: 'Energized', tone: 'text-[#2E6B52]' },
  9: { label: 'Grounded & Clear', tone: 'text-[#2E6B52]' },
  10: { label: 'Thriving', tone: 'text-[#2E6B52]' },
};

const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Restless',
  3: 'Fair',
  4: 'Restorative',
  5: 'Deep & Refreshed',
};

export function MoodTrackerSection({
  moodLogs,
  onSaveMoodLog,
}: MoodTrackerSectionProps) {
  const todayStr = getTodayDateStr();
  const existingToday = moodLogs.find((l) => l.date === todayStr);

  const [moodScore, setMoodScore] = useState<number>(existingToday?.moodScore ?? 7);
  const [sleepQuality, setSleepQuality] = useState<number>(
    existingToday?.sleepQuality ?? 4
  );
  const [sleepHours, setSleepHours] = useState<number>(
    existingToday?.sleepHours ?? 7.0
  );
  const [selectedFactors, setSelectedFactors] = useState<InfluencingFactor[]>(
    existingToday?.factors ?? ['Academics/Exams', 'Sleep']
  );
  const [journal, setJournal] = useState<string>(existingToday?.journal ?? '');
  const [savedNotice, setSavedNotice] = useState(false);

  const toggleFactor = (factor: InfluencingFactor) => {
    setSelectedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MoodLog = {
      id: existingToday?.id ?? `mood-${Date.now()}`,
      date: todayStr,
      moodScore,
      sleepQuality,
      sleepHours,
      factors: selectedFactors,
      journal: journal.trim(),
    };
    onSaveMoodLog(entry);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2600);
  };

  const streak = useMemo(() => computeMoodStreak(moodLogs), [moodLogs]);

  const sortedAsc = useMemo(
    () => [...moodLogs].sort((a, b) => a.date.localeCompare(b.date)),
    [moodLogs]
  );

  const last14 = useMemo(() => sortedAsc.slice(-14), [sortedAsc]);

  const chartData = useMemo(
    () =>
      last14.map((log) => ({
        date: formatShortDate(log.date),
        mood: log.moodScore,
        sleepHours: log.sleepHours,
        sleepQuality: log.sleepQuality,
      })),
    [last14]
  );

  const triggerBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    INFLUENCING_FACTORS.forEach((f) => {
      counts[f] = 0;
    });
    last14.forEach((log) => {
      log.factors.forEach((f) => {
        counts[f] = (counts[f] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count);
  }, [last14]);

  const avgMood =
    last14.length > 0
      ? (last14.reduce((s, l) => s + l.moodScore, 0) / last14.length).toFixed(1)
      : '—';
  const avgSleep =
    last14.length > 0
      ? (last14.reduce((s, l) => s + l.sleepHours, 0) / last14.length).toFixed(1)
      : '—';

  const recentDesc = useMemo(() => [...sortedAsc].reverse(), [sortedAsc]);

  return (
    <div className="space-y-6">
      {/* KPI Summary Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Current Streak</span>
            <Flame className="h-4 w-4 text-[#9A5B13]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {streak} <span className="text-xs font-sans font-normal text-[#546266]">days</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>Total Logs</span>
            <NotebookPen className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {moodLogs.length}{' '}
            <span className="text-xs font-sans font-normal text-[#546266]">entries</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>14-Day Avg Mood</span>
            <TrendingUp className="h-4 w-4 text-[#3D6B59]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {avgMood} <span className="text-xs font-sans font-normal text-[#546266]">/ 10</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <div className="flex items-center justify-between text-xs text-[#546266]">
            <span>14-Day Avg Sleep</span>
            <Moon className="h-4 w-4 text-[#4B6B8A]" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {avgSleep}{' '}
            <span className="text-xs font-sans font-normal text-[#546266]">hrs/night</span>
          </p>
        </div>
      </section>

      {/* Main Split: Daily Check-In Widget + 14-Day Visualization */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Daily Check-In Form */}
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-5 rounded-xl border border-[#E4E2DC] bg-white p-6 space-y-5"
        >
          <div className="pb-4 border-b border-[#EFECE6]">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-lg font-semibold text-[#1E292B]">
                Daily Mood &amp; Trigger Check-In
              </h1>
              <span className="font-mono text-xs text-[#546266] tabular-nums">
                {formatShortDate(todayStr)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#546266]">
              {existingToday
                ? 'You already logged today—adjust any value below to update your check-in.'
                : 'Take 60 seconds to record your emotional valence, rest, and key campus stressors.'}
            </p>
          </div>

          {/* 1-10 Emotional Valence Slider */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <label
                htmlFor="mood-slider"
                className="text-sm font-medium text-[#1E292B]"
              >
                Emotional Valence (1–10)
              </label>
              <div className="text-right">
                <span className="font-mono text-lg font-semibold text-[#1E292B] tabular-nums">
                  {moodScore}/10
                </span>
                <span
                  className={`ml-2 text-xs font-semibold ${MOOD_LABELS[moodScore].tone}`}
                >
                  {MOOD_LABELS[moodScore].label}
                </span>
              </div>
            </div>

            <input
              id="mood-slider"
              type="range"
              min={1}
              max={10}
              step={1}
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="w-full accent-[#3D6B59] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#546266] tabular-nums">
              <span>1 · Overwhelmed</span>
              <span>5 · Flat</span>
              <span>10 · Thriving</span>
            </div>
          </div>

          {/* Sleep Quality & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EFECE6]">
            <div>
              <label className="block text-xs font-medium text-[#1E292B] mb-2">
                Sleep Quality (1–5)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setSleepQuality(rating)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-mono font-semibold transition-colors ${
                      sleepQuality === rating
                        ? 'border-[#4B6B8A] bg-[#4B6B8A] text-white'
                        : 'border-[#E4E2DC] bg-[#F8F7F4] text-[#546266] hover:text-[#1E292B]'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] text-[#546266]">
                {SLEEP_QUALITY_LABELS[sleepQuality]}
              </p>
            </div>

            <div>
              <label
                htmlFor="sleep-hours"
                className="block text-xs font-medium text-[#1E292B] mb-2"
              >
                Hours Slept
              </label>
              <input
                id="sleep-hours"
                type="number"
                min={2}
                max={14}
                step={0.5}
                value={sleepHours}
                onChange={(e) =>
                  setSleepHours(Math.max(2, Math.min(14, Number(e.target.value) || 0)))
                }
                className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-sm font-mono tabular-nums text-[#1E292B] focus:border-[#3D6B59] focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-[#546266]">
                Recommended: 7.0–8.5 hrs
              </p>
            </div>
          </div>

          {/* Multi-select Influencing Factor Tags */}
          <div className="pt-2 border-t border-[#EFECE6] space-y-2.5">
            <p className="text-xs font-medium text-[#1E292B]">
              Influencing Factors (select all that apply)
            </p>
            <div className="flex flex-wrap gap-2">
              {INFLUENCING_FACTORS.map((factor) => {
                const active = selectedFactors.includes(factor);
                return (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => toggleFactor(factor)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#2F5446]'
                        : 'border-[#E4E2DC] bg-white text-[#546266] hover:bg-[#F8F7F4] hover:text-[#1E292B]'
                    }`}
                  >
                    {factor}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Private Reflective Journal */}
          <div className="pt-2 border-t border-[#EFECE6] space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="journal-input"
                className="text-xs font-medium text-[#1E292B]"
              >
                Private Reflective Note (Optional)
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#546266]">
                <Lock className="h-3 w-3" aria-hidden="true" />
                Never shared with counselors
              </span>
            </div>
            <textarea
              id="journal-input"
              rows={3}
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="What felt heavy or restorative today? Write freely for your own reflection..."
              className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2.5 text-sm text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#3D6B59] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2F5446] transition-colors whitespace-nowrap shrink-0"
            >
              {existingToday ? 'Update Today’s Check-In' : 'Save Daily Check-In'}
            </button>
            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2E6B52]">
                <Check className="h-4 w-4" aria-hidden="true" />
                Saved locally
              </span>
            )}
          </div>
        </form>

        {/* Right Column: Charts */}
        <div className="xl:col-span-7 space-y-6">
          {/* 14-Day Mood & Sleep Trend Chart */}
          <div className="rounded-xl border border-[#E4E2DC] bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="text-base font-semibold text-[#1E292B]">
                  14-Day Mood &amp; Sleep Trend
                </h2>
                <p className="text-xs text-[#546266] mt-0.5">
                  Compare daily emotional valence (1–10) alongside hours of sleep.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#546266]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#3D6B59]" />
                  Mood (1–10)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#4B6B8A]" />
                  Sleep (hrs)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D6B59" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3D6B59" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#546266' }}
                    axisLine={{ stroke: '#E4E2DC' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: '#546266' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E4E2DC',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#1E292B',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    name="Mood Valence"
                    stroke="#3D6B59"
                    strokeWidth={2.2}
                    fill="url(#moodAreaGrad)"
                    dot={{ r: 3, fill: '#3D6B59' }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sleepHours"
                    name="Sleep Hours"
                    stroke="#4B6B8A"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#4B6B8A' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Stress Triggers Bar Chart */}
          <div className="rounded-xl border border-[#E4E2DC] bg-white p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#1E292B]">
                Top Reported Influencing Factors (Last 14 Days)
              </h2>
              <p className="text-xs text-[#546266] mt-0.5">
                Frequency of logged factors affecting your mood and academic energy.
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={triggerBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 28, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#546266' }}
                    axisLine={{ stroke: '#E4E2DC' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="factor"
                    width={118}
                    tick={{ fontSize: 11, fill: '#1E292B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E4E2DC',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown) => [`${val} days logged`, 'Frequency']}
                  />
                  <Bar
                    dataKey="count"
                    fill="#7A6F9B"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reflective Journal & Log Timeline */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1E292B]">
              Recent Check-In &amp; Journal Log
            </h2>
            <p className="text-xs text-[#546266] mt-0.5">
              Personal timeline stored exclusively on your device.
            </p>
          </div>
          <span className="font-mono text-xs text-[#546266] tabular-nums">
            Showing {Math.min(recentDesc.length, 8)} of {recentDesc.length}
          </span>
        </div>

        <div className="divide-y divide-[#EFECE6]">
          {recentDesc.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="px-6 py-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[#546266]">
                  <span className="font-semibold text-[#1E292B]">
                    {formatFullDate(log.date)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-semibold text-[#3D6B59] tabular-nums">
                    Mood {log.moodScore}/10
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    Sleep {log.sleepHours}h ({SLEEP_QUALITY_LABELS[log.sleepQuality]})
                  </span>
                </div>
                {log.factors.length > 0 && (
                  <p className="text-xs text-[#546266]">
                    Factors: {log.factors.join(' · ')}
                  </p>
                )}
                {log.journal && (
                  <p className="text-sm text-[#1E292B] leading-relaxed">
                    {log.journal}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
