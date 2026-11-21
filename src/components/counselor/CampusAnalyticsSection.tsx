import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ShieldCheck } from 'lucide-react';
import {
  CAMPUS_STRESSOR_DISTRIBUTION,
  CAMPUS_WEEKLY_ANALYTICS,
} from '../../data/seedData';
import { AppState } from '../../types';

interface CampusAnalyticsSectionProps {
  state: AppState;
}

export function CampusAnalyticsSection({ state }: CampusAnalyticsSectionProps) {
  const totalCohortScreenings = 605 + state.assessments.length;
  const activeUrgentFlags = state.appointments.filter(
    (a) => a.triagePriority === 'high' && a.status === 'Upcoming'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & De-Identification Notice */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-xl font-semibold text-[#1E292B]">
              Anonymized Campus Wellness Analytics
            </h1>
            <p className="mt-1 text-sm text-[#546266] leading-relaxed">
              Aggregated cohort trends across the 12-week academic semester to support proactive campus resource allocation, exam-week counselor staffing, and preventive workshops.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6B52] shrink-0">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Zero Individual Identities Exposed
          </div>
        </div>
      </section>

      {/* Cohort KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <p className="text-xs text-[#546266]">Anonymized Screenings (Term)</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#1E292B] tabular-nums">
            {totalCohortScreenings}
          </p>
          <p className="mt-1 text-xs text-[#546266]">PHQ-9 · GAD-7 · PSS-10 combined</p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <p className="text-xs text-[#546266]">Peak Stress Window</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#9A5B13] tabular-nums">
            Wk 6 &amp; Wk 12
          </p>
          <p className="mt-1 text-xs text-[#546266]">Midterms &amp; End-Sem Exam cycles</p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <p className="text-xs text-[#546266]">Top Campus Stressor</p>
          <p className="mt-2 text-2xl font-semibold text-[#1E292B] tabular-nums">
            68%
          </p>
          <p className="mt-1 text-xs text-[#546266]">Academics / Exams (412 reports)</p>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-5">
          <p className="text-xs text-[#546266]">Active Priority Triage Slots</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#B42318] tabular-nums">
            {activeUrgentFlags}
          </p>
          <p className="mt-1 text-xs text-[#546266]">Queued for expedited counselor care</p>
        </div>
      </section>

      {/* Chart 1: Campus Stress Distribution Across Academic Weeks */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#1E292B]">
              Campus Stress Tier Distribution Across Academic Weeks (%)
            </h2>
            <p className="text-xs text-[#546266] mt-0.5">
              Notice elevated Moderate and High triage shares during Midterm (Wk 6) and End-Sem Exam (Wk 11–12) windows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#546266]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#3D6B59]" />
              Low / Manageable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#D99B4E]" />
              Moderate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#C85A53]" />
              High / Urgent
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={CAMPUS_WEEKLY_ANALYTICS}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#546266' }}
                axisLine={{ stroke: '#E4E2DC' }}
                tickLine={false}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
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
                }}
                labelFormatter={(label, payload) => {
                  const row = payload?.[0]?.payload as
                    | { label?: string }
                    | undefined;
                  return row?.label ? `${label} · ${row.label}` : String(label);
                }}
              />
              <Area
                type="monotone"
                dataKey="low"
                stackId="1"
                name="Low / Manageable (%)"
                stroke="#3D6B59"
                fill="#DCEAE2"
              />
              <Area
                type="monotone"
                dataKey="moderate"
                stackId="1"
                name="Moderate (%)"
                stroke="#D99B4E"
                fill="#F7E5C8"
              />
              <Area
                type="monotone"
                dataKey="high"
                stackId="1"
                name="High / Urgent (%)"
                stroke="#C85A53"
                fill="#F4D3D0"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bottom 2-Column Split: Average PHQ-9/GAD-7 Trends + Top Reported Stressors */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#E4E2DC] bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#1E292B]">
                Average Cohort PHQ-9 &amp; GAD-7 Trends
              </h2>
              <p className="text-xs text-[#546266] mt-0.5">
                Weekly mean screening scores (cohort N ≥ 50 per bucket).
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#546266]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#4B6B8A]" />
                PHQ-9
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#7A6F9B]" />
                GAD-7
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={CAMPUS_WEEKLY_ANALYTICS}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#546266' }}
                  axisLine={{ stroke: '#E4E2DC' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 16]}
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
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgPhq9"
                  name="Avg PHQ-9"
                  stroke="#4B6B8A"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: '#4B6B8A' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgGad7"
                  name="Avg GAD-7"
                  stroke="#7A6F9B"
                  strokeWidth={2.2}
                  dot={{ r: 3, fill: '#7A6F9B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E2DC] bg-white p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1E292B]">
              Top Reported Campus Stressors
            </h2>
            <p className="text-xs text-[#546266] mt-0.5">
              Share of active student check-ins citing each stressor category.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CAMPUS_STRESSOR_DISTRIBUTION}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 32, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEAE4" horizontal={false} />
                <XAxis
                  type="number"
                  unit="%"
                  domain={[0, 80]}
                  tick={{ fontSize: 11, fill: '#546266' }}
                  axisLine={{ stroke: '#E4E2DC' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="stressor"
                  width={126}
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
                  formatter={(value: unknown) => [`${value}% of students`, 'Reported']}
                />
                <Bar
                  dataKey="percentage"
                  fill="#3D6B59"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
