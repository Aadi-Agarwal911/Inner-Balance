import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react';
import { COUNSELORS, getUpcomingDates } from '../../data/seedData';
import {
  Appointment,
  AppointmentMode,
  Counselor,
  TriageLevel,
} from '../../types';
import {
  formatFullDate,
  generateReferenceId,
  getTodayDateStr,
} from '../../utils/storage';
import { TriageIndicator } from '../TriageBadge';

interface CounselorBookingSectionProps {
  studentAlias: string;
  appointments: Appointment[];
  defaultTriagePriority: TriageLevel;
  priorityModeRequested: boolean;
  onClearPriorityRequest: () => void;
  onCreateAppointment: (appointment: Appointment) => void;
  onRescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
  onCancelAppointment: (id: string) => void;
}

const SPECIALIZATION_FILTERS = [
  'All',
  'Academic Stress',
  'Anxiety & PTSD',
  'Burnout',
  'Sleep Hygiene',
  'Relationships',
];

function CounselorAvatar({ counselor }: { counselor: Counselor }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = counselor.name
    .split(' ')
    .filter((p) => !p.endsWith('.'))
    .slice(0, 2)
    .map((p) => p[0])
    .join('');

  if (imgFailed) {
    return (
      <div className="h-16 w-16 rounded-xl bg-[#DCEAE2] text-[#2F5446] flex items-center justify-center font-display text-lg font-semibold shrink-0">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={counselor.avatar}
      alt={`Portrait of ${counselor.name}`}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className="h-16 w-16 rounded-xl object-cover border border-[#E4E2DC] shrink-0"
    />
  );
}

export function CounselorBookingSection({
  studentAlias,
  appointments,
  defaultTriagePriority,
  priorityModeRequested,
  onClearPriorityRequest,
  onCreateAppointment,
  onRescheduleAppointment,
  onCancelAppointment,
}: CounselorBookingSectionProps) {
  const upcomingDates = useMemo(() => getUpcomingDates(6), []);

  const [specFilter, setSpecFilter] = useState('All');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor>(COUNSELORS[0]);
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0].dateStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [mode, setMode] = useState<AppointmentMode>('In-Person Campus Center');
  const [concernNote, setConcernNote] = useState('');
  const [isPriorityFlag, setIsPriorityFlag] = useState(
    priorityModeRequested || defaultTriagePriority === 'high'
  );
  const [confirmation, setConfirmation] = useState<Appointment | null>(null);

  // Reschedule modal state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [reschedDate, setReschedDate] = useState<string>(upcomingDates[1].dateStr);
  const [reschedTime, setReschedTime] = useState<string>('');

  const filteredCounselors = COUNSELORS.filter((c) => {
    if (specFilter === 'All') return true;
    return c.specializations.some((s) =>
      s.toLowerCase().includes(specFilter.toLowerCase().split(' ')[0])
    );
  });

  // Check if a slot is already booked (active Upcoming) for counselor + date
  const isSlotTaken = (counselorId: string, date: string, time: string, ignoreAptId?: string) => {
    return appointments.some(
      (a) =>
        a.id !== ignoreAptId &&
        a.status !== 'Cancelled' &&
        a.counselorId === counselorId &&
        a.date === date &&
        a.time === time
    );
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) return;
    if (isSlotTaken(selectedCounselor.id, selectedDate, selectedTime)) return;

    const refId = generateReferenceId(appointments.map((a) => a.referenceId));
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      referenceId: refId,
      studentAlias,
      isCurrentStudent: true,
      counselorId: selectedCounselor.id,
      counselorName: selectedCounselor.name,
      date: selectedDate,
      time: selectedTime,
      mode,
      status: 'Upcoming',
      triagePriority: isPriorityFlag ? 'high' : defaultTriagePriority,
      concernNote: concernNote.trim(),
      createdAt: getTodayDateStr(),
    };

    onCreateAppointment(newApt);
    setConfirmation(newApt);
    setSelectedTime('');
    setConcernNote('');
    if (priorityModeRequested) {
      onClearPriorityRequest();
    }
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setReschedulingApt(apt);
    setReschedDate(upcomingDates[0].dateStr);
    setReschedTime('');
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingApt || !reschedTime) return;
    if (
      isSlotTaken(
        reschedulingApt.counselorId,
        reschedDate,
        reschedTime,
        reschedulingApt.id
      )
    ) {
      return;
    }
    onRescheduleAppointment(reschedulingApt.id, reschedDate, reschedTime);
    setReschedulingApt(null);
  };

  const studentAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.isCurrentStudent)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [appointments]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-xl font-semibold text-[#1E292B]">
              Confidential Campus Counselor Booking
            </h1>
            <p className="mt-1 text-sm text-[#546266] leading-relaxed">
              Schedule a free, strictly confidential session with verified campus psychologists. Every booking receives a pseudonymized reference ID and enforces single-slot reservation to prevent double-booking.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E6B52] shrink-0">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Booking as <span className="font-mono font-semibold">{studentAlias}</span>
          </div>
        </div>

        {(priorityModeRequested || isPriorityFlag) && (
          <div className="mt-4 rounded-lg border border-[#F3C5C1] bg-[#FEF6F5] px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#7A271A]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#B42318]" aria-hidden="true" />
              <span>
                <span className="font-semibold">Priority Triage Flag Enabled: </span>
                Your booking will appear at the top of the Campus Counselor Triage Queue for expedited review.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPriorityFlag(false);
                onClearPriorityRequest();
              }}
              className="text-xs font-medium text-[#7A271A] hover:underline whitespace-nowrap shrink-0"
            >
              Switch to Standard
            </button>
          </div>
        )}
      </section>

      {/* Booking Confirmation Banner */}
      {confirmation && (
        <section className="rounded-xl border border-[#C9DED3] bg-[#F3F8F5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#2E6B52]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Confidential Session Confirmed
            </div>
            <p className="text-xs text-[#2F4741]">
              Reference ID:{' '}
              <span className="font-mono font-semibold text-[#1E292B]">
                {confirmation.referenceId}
              </span>{' '}
              · {confirmation.counselorName} · {formatFullDate(confirmation.date)} at{' '}
              {confirmation.time} ({confirmation.mode})
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmation(null)}
            className="text-xs font-medium text-[#2F4741] hover:underline whitespace-nowrap shrink-0"
          >
            Dismiss
          </button>
        </section>
      )}

      {/* Main Split: Verified Counselor Directory + Booking Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Counselor List */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {SPECIALIZATION_FILTERS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSpecFilter(spec)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  specFilter === spec
                    ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#2F5446]'
                    : 'border-[#E4E2DC] bg-white text-[#546266] hover:text-[#1E292B]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredCounselors.map((counselor) => {
              const isSelected = selectedCounselor.id === counselor.id;
              return (
                <div
                  key={counselor.id}
                  onClick={() => {
                    setSelectedCounselor(counselor);
                    setSelectedTime('');
                  }}
                  className={`cursor-pointer rounded-xl border p-5 transition-colors ${
                    isSelected
                      ? 'border-[#3D6B59] bg-[#F7FAF8]'
                      : 'border-[#E4E2DC] bg-white hover:border-[#C8D3CC]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <CounselorAvatar counselor={counselor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-semibold text-[#1E292B]">
                            {counselor.name}
                          </h2>
                          <p className="text-xs text-[#546266]">
                            {counselor.role} · {counselor.credentials}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                            isSelected ? 'text-[#3D6B59]' : 'text-[#546266]'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select →'}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-[#546266] leading-relaxed">
                        {counselor.bio}
                      </p>

                      <div className="mt-3 pt-3 border-t border-[#EFECE6] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#546266]">
                        <span className="font-medium text-[#1E292B]">
                          Focus: {counselor.specializations.join(' · ')}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-[#8A9497]" aria-hidden="true" />
                          {counselor.languages.join(', ')}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#8A9497]" aria-hidden="true" />
                          {counselor.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Slot Selection & Confidential Booking Form */}
        <form
          onSubmit={handleConfirmBooking}
          className="xl:col-span-5 rounded-xl border border-[#E4E2DC] bg-white p-6 space-y-5 xl:sticky xl:top-20"
        >
          <div className="pb-4 border-b border-[#EFECE6]">
            <p className="text-xs font-medium text-[#3D6B59]">
              Step-by-Step Confidential Reservation
            </p>
            <h2 className="mt-1 text-base font-semibold text-[#1E292B]">
              Book with {selectedCounselor.name}
            </h2>
            <p className="mt-0.5 text-xs text-[#546266]">
              {selectedCounselor.location} · 45-minute session
            </p>
          </div>

          {/* Step 1: Date Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#1E292B]">
              1. Choose Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              {upcomingDates.map((d) => (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    setSelectedTime('');
                  }}
                  className={`rounded-lg border px-2.5 py-2 text-center transition-colors ${
                    selectedDate === d.dateStr
                      ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#1E292B]'
                      : 'border-[#E4E2DC] bg-[#FAF9F6] text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  <div className="text-[11px] font-medium">{d.weekday}</div>
                  <div className="text-xs font-semibold tabular-nums">{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Time Slots with Double-Booking Prevention */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#1E292B]">
                2. Choose Available Time Slot
              </label>
              <span className="text-[11px] text-[#546266]">
                Double-booking protected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedCounselor.dailySlots.map((slot) => {
                const taken = isSlotTaken(selectedCounselor.id, selectedDate, slot);
                const chosen = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={taken}
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-lg border px-2.5 py-2 text-xs font-mono tabular-nums transition-colors ${
                      taken
                        ? 'border-[#ECEAE4] bg-[#F3F2EE] text-[#A0A8AA] line-through cursor-not-allowed'
                        : chosen
                        ? 'border-[#3D6B59] bg-[#3D6B59] text-white font-semibold'
                        : 'border-[#E4E2DC] bg-white text-[#1E292B] hover:border-[#3D6B59]'
                    }`}
                  >
                    {taken ? `${slot} (Booked)` : slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Session Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#1E292B]">
              3. Consultation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(
                ['In-Person Campus Center', 'Virtual Tele-Counseling'] as AppointmentMode[]
              ).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    mode === m
                      ? 'border-[#3D6B59] bg-[#EFF3EF] text-[#1E292B]'
                      : 'border-[#E4E2DC] bg-white text-[#546266] hover:text-[#1E292B]'
                  }`}
                >
                  {m === 'In-Person Campus Center' ? (
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#3D6B59]" aria-hidden="true" />
                  ) : (
                    <Video className="h-3.5 w-3.5 shrink-0 text-[#4B6B8A]" aria-hidden="true" />
                  )}
                  <span className="truncate">{m}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Optional Brief Concern Note */}
          <div className="space-y-1.5">
            <label
              htmlFor="concern-note"
              className="block text-xs font-medium text-[#1E292B]"
            >
              4. Brief Concern Note (Optional)
            </label>
            <textarea
              id="concern-note"
              rows={2}
              value={concernNote}
              onChange={(e) => setConcernNote(e.target.value)}
              placeholder="e.g., Exam overwhelm, sleep rhythm, or feeling burnt out..."
              className="w-full rounded-lg border border-[#D4D9D5] bg-white px-3 py-2 text-xs text-[#1E292B] placeholder:text-[#8A9497] focus:border-[#3D6B59] focus:outline-none resize-none"
            />
          </div>

          {/* Priority toggle */}
          <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-[#E4E2DC] bg-[#F8F7F4] p-3">
            <input
              type="checkbox"
              checked={isPriorityFlag}
              onChange={(e) => setIsPriorityFlag(e.target.checked)}
              className="mt-0.5 accent-[#B42318]"
            />
            <span className="text-xs text-[#546266] leading-relaxed">
              <span className="font-semibold text-[#1E292B]">
                Mark as Priority / Urgent Review
              </span>{' '}
              — alerts campus counselors to prioritize this booking in the triage queue.
            </span>
          </label>

          <button
            type="submit"
            disabled={!selectedTime}
            className="w-full rounded-lg bg-[#3D6B59] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#2F5446] disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
          >
            {selectedTime
              ? `Confirm Confidential Booking (${selectedTime})`
              : 'Select a Time Slot to Continue'}
          </button>
        </form>
      </div>

      {/* Student's Appointments Management Table */}
      <section className="rounded-xl border border-[#E4E2DC] bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1E292B]">
              Your Confidential Appointments
            </h2>
            <p className="text-xs text-[#546266] mt-0.5">
              Reschedule or cancel upcoming sessions anytime using your booking reference token.
            </p>
          </div>
          <span className="font-mono text-xs text-[#546266] tabular-nums">
            {studentAppointments.length} total
          </span>
        </div>

        {studentAppointments.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#546266]">
            No counseling sessions scheduled yet.
          </div>
        ) : (
          <div className="divide-y divide-[#EFECE6]">
            {studentAppointments.map((apt) => (
              <div
                key={apt.id}
                className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs">
                    <span className="font-mono font-semibold text-[#3D6B59]">
                      {apt.referenceId}
                    </span>
                    <span className="text-[#8A9497]">·</span>
                    <span className="font-semibold text-[#1E292B]">
                      {apt.counselorName}
                    </span>
                    <span className="text-[#8A9497]">·</span>
                    <span
                      className={`font-semibold ${
                        apt.status === 'Upcoming'
                          ? 'text-[#2E6B52]'
                          : apt.status === 'Cancelled'
                          ? 'text-[#B42318]'
                          : 'text-[#546266]'
                      }`}
                    >
                      {apt.status}
                    </span>
                    {apt.triagePriority === 'high' && (
                      <>
                        <span className="text-[#8A9497]">·</span>
                        <TriageIndicator level="high" customLabel="Priority Flagged" />
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#546266]">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Calendar className="h-3.5 w-3.5 text-[#8A9497]" aria-hidden="true" />
                      {formatFullDate(apt.date)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="h-3.5 w-3.5 text-[#8A9497]" aria-hidden="true" />
                      {apt.time}
                    </span>
                    <span>· {apt.mode}</span>
                  </div>
                  {apt.concernNote && (
                    <p className="text-xs text-[#546266] italic">
                      Note: &ldquo;{apt.concernNote}&rdquo;
                    </p>
                  )}
                </div>

                {apt.status === 'Upcoming' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenReschedule(apt)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4D9D5] bg-white px-3 py-1.5 text-xs font-medium text-[#1E292B] hover:bg-[#F8F7F4] transition-colors whitespace-nowrap shrink-0"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-[#546266]" aria-hidden="true" />
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancelAppointment(apt.id)}
                      className="rounded-lg border border-[#F3C5C1] bg-[#FEF6F5] px-3 py-1.5 text-xs font-medium text-[#B42318] hover:bg-[#FCE9E6] transition-colors whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E292B]/50 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onClick={() => setReschedulingApt(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[#E4E2DC] bg-white p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-[#3D6B59] font-semibold">
                  {reschedulingApt.referenceId}
                </p>
                <h3 className="mt-0.5 text-base font-semibold text-[#1E292B]">
                  Reschedule with {reschedulingApt.counselorName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReschedulingApt(null)}
                aria-label="Close reschedule dialog"
                className="rounded-lg p-1.5 text-[#546266] hover:bg-[#F3F2EE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#1E292B]">
                Select New Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                {upcomingDates.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => {
                      setReschedDate(d.dateStr);
                      setReschedTime('');
                    }}
                    className={`rounded-lg border px-2 py-2 text-center text-xs ${
                      reschedDate === d.dateStr
                        ? 'border-[#3D6B59] bg-[#EFF3EF] font-semibold text-[#1E292B]'
                        : 'border-[#E4E2DC] text-[#546266]'
                    }`}
                  >
                    {d.weekday} {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#1E292B]">
                Select New Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  COUNSELORS.find((c) => c.id === reschedulingApt.counselorId)
                    ?.dailySlots ?? []
                ).map((slot) => {
                  const taken = isSlotTaken(
                    reschedulingApt.counselorId,
                    reschedDate,
                    slot,
                    reschedulingApt.id
                  );
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={taken}
                      onClick={() => setReschedTime(slot)}
                      className={`rounded-lg border px-3 py-2 text-xs font-mono tabular-nums ${
                        taken
                          ? 'border-[#ECEAE4] bg-[#F3F2EE] text-[#A0A8AA] line-through cursor-not-allowed'
                          : reschedTime === slot
                          ? 'border-[#3D6B59] bg-[#3D6B59] text-white font-semibold'
                          : 'border-[#E4E2DC] text-[#1E292B] hover:border-[#3D6B59]'
                      }`}
                    >
                      {taken ? `${slot} (Booked)` : slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
              <button
                type="button"
                onClick={() => setReschedulingApt(null)}
                className="rounded-lg border border-[#D4D9D5] px-4 py-2 text-xs font-medium text-[#546266] hover:text-[#1E292B]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reschedTime}
                onClick={handleConfirmReschedule}
                className="rounded-lg bg-[#3D6B59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2F5446] disabled:opacity-45"
              >
                Save New Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
